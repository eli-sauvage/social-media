import * as express from "express"
import { checkSession } from "../models/sessions"
export function sessionHandler(req:express.Request, res:express.Response, next:express.NextFunction):void{
    // console.log(req.cookies)
    if(checkSession(req.cookies.session)) next()
    else{
        res.redirect("/connect")
    }
}