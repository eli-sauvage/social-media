import { getFollowers as getStatsTwitter, getImpressions } from './twitter'
import { getFollowers, getStories } from './instagram'
import { getFanCount as getStatsFacebook } from './facebook'
import { getFollowers as getStatsLinkedin } from './linkedin'

import { pushFacebookStat, pushInstagramStat, pushLinkedinStat, pushTwitterStat, getMultiple } from './sqlConnection'

export async function saveData() {
    console.log("saving data to sql, "+Date.now())
    let tokens = await getMultiple("SELECT tokenValue, tokenName FROM tokens WHERE tokenId IN(1, 4, 5)") as { tokenValue: string, tokenName: string }[]
    let fbToken = tokens.find(e => e.tokenName == "facebookUser").tokenValue
    pushFacebookStat(await getStatsFacebook(fbToken))
    pushInstagramStat(await getFollowers(fbToken), await getStories(fbToken))
    pushTwitterStat(await getStatsTwitter(tokens.find(e => e.tokenName == "twitterBearer").tokenValue), await getImpressions())
    pushLinkedinStat(await getStatsLinkedin(tokens.find(e => e.tokenName == "linkedIn").tokenValue))
}