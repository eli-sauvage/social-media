import axios from "axios"
import { getToken, getMultiple } from './sqlConnection'
import { writeFile, readFile } from "fs/promises"

type tweet = {
    likes: number,
    comments: number,
    retweets: number,
    date: number,
    id?:number
    impressions?:number
}

type twitterStats = {
    followers: number,
    followersHistory:{
        followers:number,
        date:number
    }[]
    posts: tweet[]
}
export async function getCache(): Promise<twitterStats> {
    try {
        let data = await readFile(__dirname + "/../cache/twitter.json") as unknown as { date: number, data: twitterStats }
        let content = JSON.parse(data.toString()) as { date: number, data: twitterStats }
        if (Date.now() - content.date < 60 * 60 * 1000) return(content.data)//cache pas trop vieux
        else return await getStats()
    }
    catch (e) {
        return await getStats()
    }
}

export async function getStats(): Promise<twitterStats> {
    let token = await getToken(4) as string
    let [followers, posts, followersHistory, impressions] = await Promise.all([getFollowers(token), getTweets(token), getFollowersHistory(),
        getMultiple("SELECT tweetId, impressions FROM twitterImpressions").catch(e=>{throw "error reading impressions"+e})
    ])
    posts.forEach(tweet=>{
        let imp = impressions.find(e=>e.tweetId==tweet.id)
        if(imp)tweet.impressions = imp.impressions
        delete tweet.id
    })
    let ret = {
        followers: followers,
        posts: posts,
        followersHistory
    }
    writeFile(__dirname + "/../cache/twitter.json", JSON.stringify({date:Date.now(), data:ret})).catch(console.error)
    return ret
}

export async function getFollowersHistory(): Promise<{ followers: number, date: number }[]> {
    let res = await getMultiple("SELECT date, numberOfFollowers FROM twitterStats").catch(e => { throw "error reading sql twitter history : " + e }) as { date: string, numberOfFollowers: number }[]
    let followers = res.map(({date, numberOfFollowers})=>({date:new Date(date).getTime(), followers:numberOfFollowers}))
    return followers 
}

export async function getFollowers(token: string): Promise<number> {
    let url = "https://api.twitter.com/2/users/787291928371064832?user.fields=public_metrics"
    let res = await axios.get(url, { headers: { "Authorization": "Bearer " + token } }).catch(e => {
        throw "error getting twitter followers : " + e
    }) as any
    try {
        return res.data.data.public_metrics.followers_count
    } catch (e) {
        throw "got error reading twitter followers : " + e
    }
}

async function getTweets(token: string): Promise<tweet[]> {
    let url = "https://api.twitter.com/2/users/787291928371064832/tweets?max_results=100&tweet.fields=public_metrics,created_at"
    let keepRequesting = true
    let tweets: tweet[] = []
    let urlNext = url
    while (keepRequesting) {
        let res = await axios.get(urlNext, { headers: { "Authorization": "Bearer " + token } }).catch(e => {
            throw "error getting twitter tweets : " + e
        }) as any
        try {
            tweets = tweets.concat(res.data.data.map(e => {
                return {
                    likes: e.public_metrics.like_count,
                    comments: e.public_metrics.reply_count,
                    retweets: e.public_metrics.retweet_count,
                    date: (new Date(e.created_at)).getTime(),
                    id:e.id
                }
            }) as tweet[])
            if (res.data.meta.next_token) {
                urlNext = url + "&pagination_token=" + res.data.meta.next_token
            } else {
                keepRequesting = false
            }
        } catch (e) {
            throw "got error reading tweets : " + e
        }
    }
    return tweets.sort((a, b)=> a.date-b.date)
}

export async function getImpressions(): Promise<{ id: number, impressions: number }[]> {
    return
}