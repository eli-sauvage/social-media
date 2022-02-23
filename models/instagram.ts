import axios from "axios"
import { getToken, getMultiple } from './sqlConnection'

type post = {
    likes: number,
    comments: number,
    date: number,
    impressions:number
}

type instaStats = {
    followers:number,
    followersHistory:{date:number, followers:number}[],
    storiesHistory:{date:number, stories:number}[],
    posts:post[]
}

export async function getStats():Promise<instaStats>{
    let token = await getToken(5).catch(e=>{
        console.log()
    }) as string
    let [followers, posts, history] = await Promise.all([
        getFollowers(token), 
        getPosts(token),
        getHistory()
    ])
    return {
        followers:followers,
        posts:posts,
        followersHistory:history.follows,
        storiesHistory:history.stories
    }
}

async function getHistory():Promise<{follows:{date:number, followers:number}[], stories:{date:number, stories:number}[]}>{
    let res = await getMultiple("SELECT date, numberOfFollowers, numberOfStories FROM instagramStats").catch(e=>{throw "error reading sql insta history : "+e}) as {date:string, numberOfFollowers:number, numberOfStories:number}[]
    let followers = res.map(({date, numberOfFollowers, numberOfStories})=>({date:new Date(date).getTime(), followers:numberOfFollowers}))
    let stories = res.map(({date, numberOfFollowers, numberOfStories})=>({date:new Date(date).getTime(), stories: numberOfStories}))
    return {
        follows:followers,
        stories:stories
    }
}

export async function getStories(token:string):Promise<number>{
    let url = "https://graph.facebook.com/v12.0/17841407084572943/stories?access_token=" + token
    let res = await axios.get(url).catch(e => { throw "error getting instagram followers : " + e }) as any
    try {
        return res.data.data.length
    } catch (e) {
        throw "got error reading instagram stories : " + e
    }
}

export async function getFollowers(token:string):Promise<number>{
    let url ="https://graph.facebook.com/v12.0/17841407084572943?fields=followers_count&access_token="+token
    let res = await axios.get(url).catch(e=>{throw "error getting instagram followers : "+e}) as any
    try{
        return res.data.followers_count
    }catch(e){
        throw "got error reading instagram followers : "+e
    }
}

async function getPosts(token:string):Promise<post[]>{
    let url = "https://graph.facebook.com/v12.0/17841407084572943?fields=media.limit(2000){timestamp, comments_count, like_count, insights.metric(impressions)}&access_token=" + token
    let res = await axios.get(url).catch(e => { throw "error getting instagram posts : "+e }) as any
    try {
        let postList:post[] = []
        res.data.media.data.forEach(e => {
            postList.push({
                likes: e.like_count,
                comments: e.comments_count,
                date: (new Date(e.timestamp)).getTime(),
                impressions:e.insights.data.find(e=>e.name=="impressions").values[0].value
            })
        })
        return postList
    } catch (e) {
        throw "got error reading instagram followers : " + e
    }
}