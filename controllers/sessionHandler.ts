import * as express from "express"
import { checkSession } from "../models/sessions"
export function sessionHandler(req:express.Request, res:express.Response, next:express.NextFunction):void{
    if(checkSession(req.cookies.session)) next() //connection ok
    else{
        res.redirect("/connect")
    }
}