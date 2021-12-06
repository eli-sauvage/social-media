import { getToken } from './sqlConnection'
import axios from 'axios'

type post = {
    id: string,
    date: number,
    likes: number,
    comments: number
}
type linkedInData = {
    followerCount: number
    posts: post[]
}


export async function getStats(): Promise<linkedInData> {
    let token = await getToken(1).catch((e) => { debugger }) as string
    let [shares, ugc, followers] = await Promise.all([getShares(token), getUgc(token), getFollowers(token)]).catch(e => { throw e })
    ugc = ugc.filter(e => !shares.map(e => e.date).includes(e.date)) //retirer doublons
    let posts: post[] = shares.concat(ugc)
    let likesComment = await getLikesComments(token, posts)
    return {
        followerCount: followers,
        posts: posts
    }
}

async function getShares(token: string): Promise<post[]> { //shares <=> posts
    let posts = []
    async function getData(url: string) {
        let response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).catch((e) => { throw "error getting linkedin shares : "+e }) as any
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
        }).catch(e => { throw "error getting linkedin ugc : "+e }) as any
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

async function getLikesComments(token: string, posts: post[]): Promise<post[]> {
    let url = "https://api.linkedin.com/v2/socialActions?"
    posts.forEach(post => url += "ids=" + post.id + "&")
    let response = await axios.get(url, { headers: { "Authorization": `Bearer ${token}` } }).catch(e => { throw "error getting linkedin likesComments"+e }) as any
    let likesComments
    try {
        likesComments = response.data.results
        for (let i = 0; i < posts.length; i++) {
            posts[i].likes = likesComments[posts[i].id].likesSummary.totalLikes
            posts[i].comments = likesComments[posts[i].id].commentsSummary.aggregatedTotalComments
        }
    } catch (e) {
        throw "got error reading linkedIn likesComments" + e
    }
    return posts
}

export async function getFollowers(apiToken: string): Promise<number> {
    let url = "https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:9428607"
    let follows = await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${apiToken}`
        }
    }).catch(e => { throw "error getting linkedin followers : "+e }) as any
    let followerCount: number
    try {
        followerCount = follows.data.elements[0].followerCountsByAssociationType[0].followerCounts.organicFollowerCount//non-employees
        followerCount += follows.data.elements[0].followerCountsByAssociationType[1].followerCounts.organicFollowerCount//employees
    } catch (e) {
        throw "error reading linkedIn followers : " + e
    }
    return followerCount
}