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
exports.getFollowers = exports.getStories = exports.getStats = void 0;
var axios_1 = require("axios");
var sqlConnection_1 = require("./sqlConnection");
function getStats() {
    return __awaiter(this, void 0, void 0, function () {
        var token, _a, followers, posts, history;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, sqlConnection_1.getToken)(5)];
                case 1:
                    token = _b.sent();
                    return [4 /*yield*/, Promise.all([
                            getFollowers(token),
                            getPosts(token),
                            getHistory()
                        ])];
                case 2:
                    _a = _b.sent(), followers = _a[0], posts = _a[1], history = _a[2];
                    return [2 /*return*/, {
                            followers: followers,
                            posts: posts,
                            followersHistory: history.follows,
                            storiesHistory: history.stories
                        }];
            }
        });
    });
}
exports.getStats = getStats;
function getHistory() {
    return __awaiter(this, void 0, void 0, function () {
        var res, followers, stories;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sqlConnection_1.getMultiple)("SELECT date, numberOfFollowers, numberOfStories FROM instagramStats").catch(function (e) { throw "error reading sql insta history : " + e; })];
                case 1:
                    res = _a.sent();
                    followers = res.map(function (_a) {
                        var date = _a.date, numberOfFollowers = _a.numberOfFollowers, numberOfStories = _a.numberOfStories;
                        return ({ date: new Date(date).getTime(), followers: numberOfFollowers });
                    });
                    stories = res.map(function (_a) {
                        var date = _a.date, numberOfFollowers = _a.numberOfFollowers, numberOfStories = _a.numberOfStories;
                        return ({ date: new Date(date).getTime(), stories: numberOfStories });
                    });
                    return [2 /*return*/, {
                            follows: followers,
                            stories: stories
                        }];
            }
        });
    });
}
function getStories(token) {
    return __awaiter(this, void 0, void 0, function () {
        var url, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://graph.facebook.com/v12.0/17841407084572943/stories?access_token=" + token;
                    return [4 /*yield*/, axios_1.default.get(url).catch(function (e) { throw "error getting instagram followers : " + e; })];
                case 1:
                    res = _a.sent();
                    try {
                        return [2 /*return*/, res.data.data.length];
                    }
                    catch (e) {
                        throw "got error reading instagram stories : " + e;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getStories = getStories;
function getFollowers(token) {
    return __awaiter(this, void 0, void 0, function () {
        var url, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://graph.facebook.com/v12.0/17841407084572943?fields=followers_count&access_token=" + token;
                    return [4 /*yield*/, axios_1.default.get(url).catch(function (e) { throw "error getting instagram followers : " + e; })];
                case 1:
                    res = _a.sent();
                    try {
                        return [2 /*return*/, res.data.followers_count];
                    }
                    catch (e) {
                        throw "got error reading instagram followers : " + e;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getFollowers = getFollowers;
function getPosts(token) {
    return __awaiter(this, void 0, void 0, function () {
        var url, res, postList_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://graph.facebook.com/v12.0/17841407084572943?fields=media.limit(2000){timestamp, comments_count, like_count, insights.metric(impressions)}&access_token=" + token;
                    return [4 /*yield*/, axios_1.default.get(url).catch(function (e) { throw "error getting instagram posts : " + e; })];
                case 1:
                    res = _a.sent();
                    try {
                        postList_1 = [];
                        res.data.media.data.forEach(function (e) {
                            postList_1.push({
                                likes: e.like_count,
                                comments: e.comments_count,
                                date: (new Date(e.timestamp)).getTime(),
                                impressions: e.insights.data.find(function (e) { return e.name == "impressions"; }).values[0].value
                            });
                        });
                        return [2 /*return*/, postList_1];
                    }
                    catch (e) {
                        throw "got error reading instagram followers : " + e;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=instagram.js.map