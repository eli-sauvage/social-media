type session = {
    id:string,
    expiration:Date
}
let sessions:session[] = []

export function checkSession(id:string):boolean{
    removeExpiredSessions()
    if(sessions.find(e=>e.id==id))
        return true
    else
        return false
}

export function createSession():session{
    let id = randomId()
    const today = new Date()
    const tomorrow = new Date(today)
    // tomorrow.setMinutes(tomorrow.getMinutes()+1)
    tomorrow.setDate(tomorrow.getDate() + 1)
    let newSession: session = {
        id : id,
        expiration:tomorrow
    }
    sessions.push(newSession)
    return newSession
}

function removeExpiredSessions():void{
    sessions = sessions.filter(e=>e.expiration.getTime() > Date.now())
}

function randomId():string {
    function s4():string{
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


