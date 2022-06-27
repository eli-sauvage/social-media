import * as mysql from 'mysql';
let pool: mysql.Pool;

export async function initConnection() {
    pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.MYSQLHOST,
        user: 'jcAnalyzerBot',
        port: process.env.MYSQLPORT as any,
        password: process.env.MYSQLPASSWORD,
        database: 'jcAnalyzer'

    })
    pool.getConnection((err, connection) => {
        if (err) {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error('Database connection was closed.')
            }
            if (err.code === 'ER_CON_COUNT_ERROR') {
                console.error('Database has too many connections.')
            }
            if (err.code === 'ECONNREFUSED') {
                console.error('Database connection was refused.')
            }
            else console.error("unknown error" + err)
        }
        if (connection) connection.release()
        return
    })
}
export function query(query: string) {
    return new Promise((res, rej) => {
        pool.query(query, (e, result) => {
            if (e) {
                console.error(e)
                rej(e)
            } else
                res(result)
        })
    }).catch(console.log)
}

export function getSingleVal(query: string) {
    return new Promise((resolve, rej) => {
        pool.query(query, (e, res: any) => {
            if (e) return rej(e)
            // res = Array.from(res)
            if (res.length != 1) return rej("get single prop returned > 1 or 0 row")
            if (Object.keys(res[0]).length != 1) rej("get single prop returned > 1 or 0 columns")
            resolve(res[0][Object.keys(res[0])[0]])
        })
    })
}
export function getRow(query: string) {
    return new Promise((resolve, rej) => {
        pool.query(query, (e, res: any) => {
            if (e) rej(e)
            if (res.length != 1) rej("get single prop returned > 1 or 0 row")
            resolve(res[0])
        })
    })
}

export function getColumn(query: string) {
    return new Promise((resolve, rej) => {
        pool.query(query, (e, res: any) => {
            if (e) rej(e)
            if (!res.every((e: any) => Object.keys(e).length == 1)) rej("get getColumn returned > 1 or 0 columns")
            resolve(res.map((e: any) => e[Object.keys(e)[0]]))
        })
    })
}

export function getMultiple(query: string): Promise<any> {
    return new Promise((resolve, rej) => {
        pool.query(query, (e, res) => {
            if (e) rej(e)
            resolve(res)
        })
    })
}

export function get(type: string, query: string) {
    switch (type) {
        case 'val': return this.getSingleVal(query)
        case 'row': return this.getRow(query)
        case 'column': return this.getColumn(query)
        case '': return this.getMultiple(query)
        default: console.error(`wrong type specified, received :${type}`)
    }
}

export async function getToken(id: number) {
    return await getSingleVal(`SELECT tokenValue FROM tokens where tokenId=${id}`).catch(console.error)
}

export async function updateToken(id:number, newToken:string){
    query(`UPDATE tokens SET tokenValue="${newToken}" WHERE tokenId=${id}`)
}

export function pushTwitterStat(numberofFollowers: number, tweetsWithImpressions: { id: number, impressions: number }[] | null) {
    query(`INSERT INTO twitterStats (date, numberOfFollowers) VALUES (NOW(), ${numberofFollowers})`)
        .catch(e => { throw "error writing into twitterStats" })
    if (tweetsWithImpressions)tweetsWithImpressions.forEach(tweet => {
        query(`INSERT INTO twitterImpressions (tweetId, impressions) VALUES (${tweet.id}, ${tweet.impressions}) ON DUPLICATE KEY UPDATE impressions=${tweet.impressions}`)
    })
}
export async function pushInstagramStat(numberOfFollowers: number, currentStories: number) {
    query(`INSERT INTO instagramStats (date, numberOfStories, numberOfFollowers) VALUES (NOW(),${currentStories}, ${numberOfFollowers})`)
        .catch(e => { throw "error writing into instagramStats" })
}
export function pushLinkedinStat(numberofFollowers: number) {
    query(`INSERT INTO linkedinStats (date, numberOfFollowers) VALUES (NOW(), ${numberofFollowers})`)
        .catch(e => { throw "error writing into linkedinStats" })
}
export function pushFacebookStat(numberofFollowers: number) {
    query(`INSERT INTO facebookStats (date, numberOfFollowers) VALUES (NOW(), ${numberofFollowers})`)
        .catch(e => { throw "error writing into facebookStats" })
}