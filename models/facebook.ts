import { getMultiple, getToken } from './sqlConnection'
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

export async function getCache(): Promise<fbData> {
    try {
        let data = await readFile(__dirname + "/../cache/facebook.json") as unknown as { date: number, data: fbData }
        let content = JSON.parse(data.toString()) as { date: number, data: fbData }
        if (Date.now() - content.date < 60 * 60 * 1000) return(content.data)//cache pas trop vieux
        else return await getStats()
    }
    catch (e) {
        return await getStats()
    }
}

export async function getStats(): Promise<fbData> {
    let token = await getToken(5).catch((e) => { throw e }) as string
    let pageToken = await getToken(8).catch((e) => { throw e }) as string

    let res = await Promise.all([
        getFanCount(token),
        getPosts(pageToken),
        getFollowersHistory()
    ]).catch((e) => { throw e })
    let ret = {
        followers: res[0],
        posts: res[1],
        followersHistory: res[2]
    }
    writeFile(__dirname + "/../cache/facebook.json", JSON.stringify({date:Date.now(), data:ret})).catch(console.error)
    return ret
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
    let url = "https://graph.facebook.com/153303758193756?fields=posts.limit(2000){id, reactions.summary(1), created_time, insights.metric(post_impressions), comments.summary(true).filter(stream), sharedposts}&access_token=" + token
    let res = await axios.get(url).catch(e => { throw "error getting facebook posts : " + e }) as any
    let response: posts = []
    try {
        let postList = res.data.posts.data
        postList.forEach(post => {
            response.push({
                date: (new Date(post.created_time)).getTime(),
                likes: post.reactions ? post.reactions.summary.total_count : 0,
                impressions: post.insights.data.find(e => e.name == "post_impressions").values[0].value,
                comments: post.comments.summary.total_count,
                shares: post.sharedposts ? post.sharedposts.data.length : 0
            })
        })
        return response.sort((a, b)=> a.date-b.date)
    } catch (error) {
        throw "got error on facebook post call: " + error
    }
}