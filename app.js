"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
require('dotenv').config();
var sqlConnection_1 = require("./models/sqlConnection");
var index_1 = require("./controllers/index");
var facebookRoute_1 = require("./controllers/facebookRoute");
var twitterRoute_1 = require("./controllers/twitterRoute");
var instaRoute_1 = require("./controllers/instaRoute");
var linkedInRoute_1 = require("./controllers/linkedInRoute");
var dailySaveToSql_1 = require("./models/dailySaveToSql");
var node_schedule_1 = require("node-schedule");
var app = express();
// view engine setup
app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, "views", 'public')));
app.use('/', index_1.default);
app.use('/facebook', facebookRoute_1.router);
app.use('/instagram', instaRoute_1.router);
app.use('/twitter', twitterRoute_1.router);
app.use('/linkedin', linkedInRoute_1.router);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.set('port', process.env.PORT || 3000);
var server;
(0, sqlConnection_1.initConnection)().then(function () {
    server = app.listen(app.get('port'), function () {
        console.log("Express server listening on port ".concat(server.address().port, " and mysql initilized"));
        (0, node_schedule_1.scheduleJob)("dailySaveSql", { hour: 2, minute: 0 }, function () { (0, dailySaveToSql_1.saveData)().catch(function (e) { debugger; }); });
    });
}).catch(console.error);
process.on("uncaughtException", function (e) { debugger; });
process.on("unhandledRejection", function (e) { debugger; });
//TODO : impressions; display as table; auth; (graph); try to follow indicateurs table
//# sourceMappingURL=app.js.map