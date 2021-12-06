"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushFacebookStat = exports.pushLinkedinStat = exports.pushInstagramStat = exports.pushTwitterStat = exports.getToken = exports.get = exports.getMultiple = exports.getColumn = exports.getRow = exports.getSingleVal = exports.query = exports.initConnection = exports.connection = void 0;
var mysql = require("mysql");
function initConnection() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exports.connection = mysql.createConnection({
                        host: process.env.MYSQLHOST,
                        user: 'jcAnalyzerBot',
                        port: process.env.MYSQLPORT,
                        password: process.env.MYSQLPASSWORD,
                        database: 'jcAnalyzer'
                    });
                    return [4 /*yield*/, new Promise(function (res, rej) {
                            exports.connection.connect(function (err) {
                                if (err) {
                                    rej(err);
                                }
                                res();
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.initConnection = initConnection;
function query(query) {
    return new Promise(function (res, rej) {
        exports.connection.query(query, function (e, result) {
            if (e) {
                console.error(e);
                rej(e);
            }
            else
                res(result);
        });
    }).catch(console.log);
}
exports.query = query;
function getSingleVal(query) {
    return new Promise(function (resolve, rej) {
        exports.connection.query(query, function (e, res) {
            if (e)
                return rej(e);
            // res = Array.from(res)
            if (res.length != 1)
                return rej("get single prop returned > 1 or 0 row");
            if (Object.keys(res[0]).length != 1)
                rej("get single prop returned > 1 or 0 columns");
            resolve(res[0][Object.keys(res[0])[0]]);
        });
    });
}
exports.getSingleVal = getSingleVal;
function getRow(query) {
    return new Promise(function (resolve, rej) {
        exports.connection.query(query, function (e, res) {
            if (e)
                rej(e);
            if (res.length != 1)
                rej("get single prop returned > 1 or 0 row");
            resolve(res[0]);
        });
    });
}
exports.getRow = getRow;
function getColumn(query) {
    return new Promise(function (resolve, rej) {
        exports.connection.query(query, function (e, res) {
            if (e)
                rej(e);
            if (!res.every(function (e) { return Object.keys(e).length == 1; }))
                rej("get getColumn returned > 1 or 0 columns");
            resolve(res.map(function (e) { return e[Object.keys(e)[0]]; }));
        });
    });
}
exports.getColumn = getColumn;
function getMultiple(query) {
    return new Promise(function (resolve, rej) {
        exports.connection.query(query, function (e, res) {
            if (e)
                rej(e);
            resolve(res);
        });
    });
}
exports.getMultiple = getMultiple;
function get(type, query) {
    switch (type) {
        case 'val': return this.getSingleVal(query);
        case 'row': return this.getRow(query);
        case 'column': return this.getColumn(query);
        case '': return this.getMultiple(query);
        default: console.error("wrong type specified, received :".concat(type));
    }
}
exports.get = get;
function getToken(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSingleVal("SELECT tokenValue FROM tokens where tokenId=".concat(id)).catch(function (e) { debugger; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getToken = getToken;
function pushTwitterStat(numberofFollowers, tweetsWithImpressions) {
    query("INSERT INTO twitterStats (date, numberOfFollowers) VALUES (NOW(), ".concat(numberofFollowers, ")"))
        .catch(function (e) { throw "error writing into twitterStats"; });
    tweetsWithImpressions.forEach(function (tweet) {
        query("INSERT INTO twitterImpressions (tweetId, impressions) VALUES (".concat(tweet.id, ", ").concat(tweet.impressions, ") ON DUPLICATE KEY UPDATE impressions=").concat(tweet.impressions));
    });
}
exports.pushTwitterStat = pushTwitterStat;
function pushInstagramStat(numberOfFollowers, currentStories) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            query("INSERT INTO instagramStats (date, numberOfStories, numberOfFollowers) VALUES (NOW(),".concat(currentStories, ", ").concat(numberOfFollowers, ")"))
                .catch(function (e) { throw "error writing into instagramStats"; });
            return [2 /*return*/];
        });
    });
}
exports.pushInstagramStat = pushInstagramStat;
function pushLinkedinStat(numberofFollowers) {
    query("INSERT INTO linkedinStats (date, numberOfFollowers) VALUES (NOW(), ".concat(numberofFollowers, ")"))
        .catch(function (e) { throw "error writing into linkedinStats"; });
}
exports.pushLinkedinStat = pushLinkedinStat;
function pushFacebookStat(numberofFollowers) {
    query("INSERT INTO facebookStats (date, numberOfFollowers) VALUES (NOW(), ".concat(numberofFollowers, ")"))
        .catch(function (e) { throw "error writing into facebookStats"; });
}
exports.pushFacebookStat = pushFacebookStat;
//# sourceMappingURL=sqlConnection.js.map