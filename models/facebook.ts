import { getMultiple, getToken, updateToken } from './sqlConnection'
import axios from 'axios'
import { writeFile, readFile } from "fs/promises"

type posts = {
    date: number,
    likes: number,
    impressions: number,
    comments: number,
    shares: number
}[]

type fbData = {
    followers: number,
    posts: posts,
    followersHistory: { date: number, followers: number }[],
}

export let state: number | null

let client_id = "159776753022558"
let redirect_url = "https://stats-reseaux.jc-utt.fr/facebook/login"


export async function getCache(): Promise<fbData | string> {
    try {
        let data = await readFile("cache/facebook.json") as unknown as { date: number, data: fbData }
        let content = JSON.parse(data.toString()) as { date: number, data: fbData }
        if (Date.now() - content.date < 60 * 60 * 1000) return (content.data)//cache pas trop vieux
        else return await getStats()
    }
    catch (e) {
        return await getStats()
    }
}

export async function tokenChange(code: string):Promise<boolean>{
    let client_secret = await getToken(9) as string
    state = null
    let url = `https://graph.facebook.com/v14.0/oauth/access_token?client_id=${client_id}&redirect_uri=${redirect_url}&client_secret=${client_secret}&code=${code}`
    let res = await axios.get(url)
    await updateToken(5, res.data.access_token)
    return true
}

enum payload { connectionUrl, newPageToken }

export async function getStats(): Promise<fbData> {
    let userToken = await getToken(5) as string
    let pageToken = await getToken(8) as string
    let tokenVerify = await verifyToken(userToken, pageToken)
    if (tokenVerify.type == payload.connectionUrl) {
        throw { msg: "connectionError", connectionUrl: tokenVerify.value }
    } else if (tokenVerify.type == payload.newPageToken){
        pageToken = tokenVerify.value
    }

    let res = await Promise.all([
        getFanCount(userToken),
        getPosts(pageToken),
        getFollowersHistory()
    ])
    let ret = {
        followers: res[0],
        posts: res[1],
        followersHistory: res[2]
    }
    writeFile("cache/facebook.json", JSON.stringify({ date: Date.now(), data: ret })).catch(console.error)
    return ret
}

async function verifyToken(userToken: string, pageToken: string): Promise<{ type: payload, value:string}> {
    if(pageToken == "")pageToken="a"//debug token not accepting empty tokens
    if(userToken == "") userToken="a"
    let url = `https://graph.facebook.com/debug_token?input_token=${pageToken}&access_token=${userToken}`
    let res = await axios.get(url).catch(e => {
        if (e.response.data.error.type == "OAuthException") {//invalid user token
            state = Math.round(Math.random() * 10000000000)
            return { error: true, msg: "connectionError", connectionUrl: `https://www.facebook.com/v14.0/dialog/oauth?client_id=${client_id}&redirect_uri=${redirect_url}&state=${state}` }
        }
    }) as any
    if (res.error && res.msg == "connectionError") return { type:payload.connectionUrl, value:res.connectionUrl}
    let tokenData = res.data.data
    if (tokenData.is_valid) return
    else{//wrong page token
        //get userID
        let userId = (await axios.get(`https://graph.facebook.com/me?fields=id&access_token=${userToken}`)).data.id
        let pages = (await axios.get(`https://graph.facebook.com/${userId}/accounts?access_token=${userToken}`)).data.data
        let page = pages.find(e => e.id =="153303758193756")
        if(page){
            pageToken = page.access_token
            updateToken(8, pageToken)
            return {type:payload.newPageToken, value:pageToken}
        }else{
            throw "l'utilisateur dont l'access token est dans la DB n'est pas admin de jcutt"
        }
    }
}

async function getFollowersHistory(): Promise<{ date: number, followers: number }[]> {
    let res = await getMultiple("SELECT date, numberOfFollowers FROM facebookStats").catch(e => { throw "error reading sql facebook followers : " + e })
    res = res.map(({ date, numberOfFollowers }) => ({ date: new Date(date).getTime(), followers: numberOfFollowers }))
    return res as { date: number, followers: number }[]
}

export async function getFanCount(token: string): Promise<number> {
    let url = `https://graph.facebook.com/153303758193756?fields=fan_count&access_token=${token}`
    let res = await axios.get(url).catch(e => { throw "error getting facebook fanCount : " + e }) as any
    try {
        return res.data.fan_count
    } catch (error) {
        throw "got error on facebook fan call: " + error
    }
}

async function getPosts(token: string): Promise<posts> {
    let url = "https://graph.facebook.com/153303758193756/posts?fields=id, reactions.summary(1), created_time, insights.metric(post_impressions), comments.summary(true).filter(stream), sharedposts&limit=99&access_token=" + token
    let postList = []
    try {
        while (url) { //tant qu'il existe une nvle page
            let res = await axios.get(url).catch(e => {
                throw { msg: "error getting facebook posts", details: e }
            }) as any
            if (res.data.data) postList = [...postList, ...res.data.data]
            url = res.data.paging.next || null
        }
        let response: posts = []
        postList.forEach(post => {
            response.push({
                date: (new Date(post.created_time)).getTime(),
                likes: post.reactions ? post.reactions.summary.total_count : 0,
                impressions: post.insights.data.find(e => e.name == "post_impressions").values[0].value,
                comments: post.comments.summary.total_count,
                shares: post.sharedposts ? post.sharedposts.data.length : 0
            })
        })
        return response.sort((a, b) => a.date - b.date)
    } catch (error) {
        throw "got error on facebook post call: " + error
    }
}