import * as express from 'express';
import { AddressInfo } from "net";
import * as path from 'path';
import * as ws from 'ws';
import { Server } from 'http';

require('dotenv').config()

import { initConnection as initMySql } from './models/sqlConnection'

import routes from './controllers/index';
import { router as routesFb} from './controllers/facebookRoute'
import { router as routesTw } from './controllers/twitterRoute'
import { router as routesInsta } from './controllers/instaRoute'
import { router as routesLinkedIn } from './controllers/linkedInRoute'
import {router as routesConnect} from './controllers/connectRoute'
import {sessionHandler } from "./controllers/sessionHandler"

import { saveData } from './models/dailySaveToSql'

import {scheduleJob} from 'node-schedule'

import * as cookieParser from "cookie-parser"


const app = express();

// view engine setup
app.engine('pug', require('pug').__express)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, "views", 'public')));
app.use(cookieParser())

app.use('/connect', routesConnect);
app.use("/*", sessionHandler)
app.use('/', routes);
app.use('/facebook', routesFb);
app.use('/instagram', routesInsta);
app.use('/twitter', routesTw);
app.use('/linkedin', routesLinkedIn);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

let server: Server
initMySql().then(() => {
    server = app.listen(app.get('port'), function () {
        console.log(`Express server listening on port ${(server.address() as AddressInfo).port} and mysql initilized`);
        scheduleJob("dailySaveSql", {hour:2, minute:0}, ()=>{saveData().catch(e=>{debugger})})
    });
}).catch(console.error)

process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)

//TODO : impressions; display as table; auth; (graph); try to follow indicateurs table