import { getToken, getMultiple, updateToken } from './sqlConnection'
import axios from 'axios'

import { writeFile, readFile } from "fs/promises"
type post = {
    id: string,
    date: number,
}
type insights = {
    date: number,
    impressions: number,
    engagementRate: number
}[]
type linkedInData = {
    followers: number,
    followersHistory: { date: number, followers: number }[]
    posts: post[],
    insights: insights
}

let clientId = "78yo6lujfbczrc"
enum TVPayload { //token verif payload
    OK,
    connectionUrl
}
export let state: number | null
let scope ="r_organization_social%20rw_organization_admin%20w_member_social%20w_organization_social"
let redirectUrl = "https://stats-reseaux.jc-utt.fr/linkedin/login"


export async function getCache(): Promise<linkedInData> {
    try {
        let data = await readFile("cache/linkedin.json") as unknown as { date: number, data: linkedInData }
        let content = JSON.parse(data.toString()) as { date: number, data: linkedInData }
        if (Date.now() - content.date < 60 * 60 * 1000) return (content.data)//cache pas trop vieux
        else return await getStats()
    }
    catch (e) {
        return await getStats()
    }
}
export async function getStats(): Promise<linkedInData> {
    let token = await getToken(1) as string
    let clientSecret = await getToken(10) as string
    let tokenVerif = await verifToken(clientSecret, token)
    if(tokenVerif.type == TVPayload.connectionUrl)
        throw { msg: "connectionError", connectionUrl: tokenVerif.value }
    let [shares, ugc, followers, followersHistory, insights] = await Promise.all([
        getShares(token),
        getUgc(token),
        getFollowers(token),
        getFollowersHistory(),
        getInsights(token)
    ])
    ugc = ugc.filter(e => !shares.map(e => e.date).includes(e.date)) //retirer doublons
    let posts: post[] = shares.concat(ugc)
    // await setLikesComments(token, posts)
    let ret = {
        followers: followers,
        posts: posts.sort((a, b) => a.date - b.date),
        followersHistory: followersHistory,
        insights: insights
    }
    writeFile("cache/linkedin.json", JSON.stringify({ date: Date.now(), data: ret })).catch(console.error)
    return ret
}

async function verifToken(clientSecret: string, token: string): Promise<{ type: TVPayload, value?: string }> {
    const params = new URLSearchParams() //x-www-form-urlencoded
    params.append("client_id", clientId)
    params.append("client_secret", clientSecret)
    params.append("token", token)
    let res = await axios.post(`https://www.linkedin.com/oauth/v2/introspectToken`, params).catch(e => {
        console.log({ msg: "error verifying linkedin token : ", err: e.response.data })
        return { data: { active: false } } //probably bad token
    }) as any
    if (res.data.active) return { type: TVPayload.OK } //token valide
    else {
        state = Math.round(Math.random() * 10000000000)
        return { type: TVPayload.connectionUrl, value: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&state=${state}&scope=${scope}`}
    }

}
export async function tokenChange(code: string): Promise<boolean> {
    let client_secret = await getToken(10) as string
    state = null
    let url = `https://www.linkedin.com/oauth/v2/accessToken`
    const params = new URLSearchParams()//x-www-form-urlencoded
    params.append("grant_type", "authorization_code")
    params.append("code", code)
    params.append("client_id", clientId)
    params.append("client_secret", client_secret)
    params.append("redirect_uri", redirectUrl)
    let res = await axios.post(url, params)
    await updateToken(1, res.data.access_token)
    return true
}



//récupération des données ---------------------------------------------------------------------------------

async function getFollowersHistory(): Promise<{ date: number, followers: number }[]> {
    let res = await getMultiple("SELECT date, numberOfFollowers FROM linkedinStats").catch(e => { throw "error reading sql linkedin followers : " + e })
    res = res.map(({ date, numberOfFollowers }) => ({ date: new Date(date).getTime(), followers: numberOfFollowers }))
    return res as { date: number, followers: number }[]
}

async function getShares(token: string): Promise<post[]> { //shares <=> posts
    let posts = []
    async function getData(url: string) {
        let response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).catch((e) => { throw "error getting linkedin shares : " + e }) as any
        let data = response.data
        posts = posts.concat(data.elements)
        let nextlink = data.paging.links.filter(e => e.rel == "next")[0]
        if (nextlink) {
            await getData("https://api.linkedin.com" + nextlink.href)
        }
    }
    await getData(`https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:9428607&sortBy=LAST_MODIFIED&sharesPerOwner=500&start=0&count=50`)
    // return posts
    return posts.map(e => { return { id: e.activity, date: e.created.time, likes: 0, comments: 0 } })
}

async function getUgc(token: string): Promise<post[]> {
    let posts = []
    async function getData(url: string) {
        let response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-Restli-Protocol-Version": "2.0.0"
            }
        }).catch(e => { throw "error getting linkedin ugc : " + e }) as any
        let data = response.data
        posts = posts.concat(data.elements)
        let nextlink = data.paging.links.filter(e => e.rel == "next")[0]
        if (nextlink) {
            await getData("https://api.linkedin.com" + nextlink.href)
        }
    }
    await getData(`https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aorganization%3A9428607)&sortBy=LAST_MODIFIED&count=50`)
    // return posts
    return posts.filter(e => e.lifecycleState == "PUBLISHED").map(e => { return { id: e.id, date: e.created.time, likes: 0, comments: 0 } })

}

async function getInsights(token: string): Promise<insights> {
    let fourteenMonthsAgo = new Date(Date.now() - 14 * 30 * 24 * 60 * 60 * 1000).getTime()
    let beginDate = new Date(fourteenMonthsAgo + (7 - new Date(fourteenMonthsAgo).getDay()) * 24 * 60 * 60 * 1000).getTime()//for it to be a sunday (7th day)
    let endDate = Date.now()
    let url = `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:2414183&timeIntervals.timeGranularityType=WEEK&timeIntervals.timeRange.start=${beginDate}&timeIntervals.timeRange.end=${endDate}&count=100`
    let response = await axios.get(url, { headers: { "Authorization": `Bearer ${token}` } }).catch(e => { throw "error getting linkedin likesComments" + e }) as any
    try {
        let data = response.data.elements
        let insights = data.map(e => {
            return {
                date: e.timeRange.start + 24 * 60 * 60 * 1000,
                impressions: e.totalShareStatistics.impressionCount,
                engagementRate: e.totalShareStatistics.engagement
            }
        }) as insights
        return insights
    } catch (e) {
        throw "got error reading linkedIn likesComments" + e
    }
}

export async function getFollowers(apiToken: string): Promise<number> {
    let url = "https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:9428607"
    let follows = await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${apiToken}`
        }
    }).catch(e => { throw "error getting linkedin followers : " + e }) as any
    let followerCount: number
    try {
        followerCount = follows.data.elements[0].followerCountsByAssociationType[0].followerCounts.organicFollowerCount//non-employees
        followerCount += follows.data.elements[0].followerCountsByAssociationType[1].followerCounts.organicFollowerCount//employees
    } catch (e) {
        throw "error reading linkedIn followers : " + e
    }
    return followerCount
}