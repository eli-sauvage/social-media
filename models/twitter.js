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
exports.getImpressions = exports.getFollowers = exports.getFollowersHistory = exports.getStats = void 0;
var axios_1 = require("axios");
var sqlConnection_1 = require("./sqlConnection");
function getStats() {
    return __awaiter(this, void 0, void 0, function () {
        var token, _a, followers, posts, followersHistory, impressions;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, sqlConnection_1.getToken)(4)];
                case 1:
                    token = _b.sent();
                    return [4 /*yield*/, Promise.all([getFollowers(token), getTweets(token), getFollowersHistory(),
                            (0, sqlConnection_1.getMultiple)("SELECT tweetId, impressions FROM twitterImpressions").catch(function (e) { throw "error reading impressions" + e; })
                        ])];
                case 2:
                    _a = _b.sent(), followers = _a[0], posts = _a[1], followersHistory = _a[2], impressions = _a[3];
                    posts.forEach(function (tweet) {
                        var imp = impressions.find(function (e) { return e.tweetId == tweet.id; });
                        if (imp)
                            tweet.impressions = imp.impressions;
                        delete tweet.id;
                    });
                    return [2 /*return*/, {
                            followers: followers,
                            posts: posts,
                            followersHistory: followersHistory
                        }];
            }
        });
    });
}
exports.getStats = getStats;
function getFollowersHistory() {
    return __awaiter(this, void 0, void 0, function () {
        var res, followers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sqlConnection_1.getMultiple)("SELECT date, numberOfFollowers FROM twitterStats").catch(function (e) { throw "error reading sql twitter history : " + e; })];
                case 1:
                    res = _a.sent();
                    followers = res.map(function (_a) {
                        var date = _a.date, numberOfFollowers = _a.numberOfFollowers;
                        return ({ date: new Date(date).getTime(), followers: numberOfFollowers });
                    });
                    return [2 /*return*/, followers];
            }
        });
    });
}
exports.getFollowersHistory = getFollowersHistory;
function getFollowers(token) {
    return __awaiter(this, void 0, void 0, function () {
        var url, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.twitter.com/2/users/787291928371064832?user.fields=public_metrics";
                    return [4 /*yield*/, axios_1.default.get(url, { headers: { "Authorization": "Bearer " + token } }).catch(function (e) {
                            throw "error getting twitter followers : " + e;
                        })];
                case 1:
                    res = _a.sent();
                    try {
                        return [2 /*return*/, res.data.data.public_metrics.followers_count];
                    }
                    catch (e) {
                        throw "got error reading twitter followers : " + e;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getFollowers = getFollowers;
function getTweets(token) {
    return __awaiter(this, void 0, void 0, function () {
        var url, keepRequesting, tweets, urlNext, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.twitter.com/2/users/787291928371064832/tweets?max_results=100&tweet.fields=public_metrics,created_at";
                    keepRequesting = true;
                    tweets = [];
                    urlNext = url;
                    _a.label = 1;
                case 1:
                    if (!keepRequesting) return [3 /*break*/, 3];
                    return [4 /*yield*/, axios_1.default.get(urlNext, { headers: { "Authorization": "Bearer " + token } }).catch(function (e) {
                            throw "error getting twitter tweets : " + e;
                        })];
                case 2:
                    res = _a.sent();
                    try {
                        tweets = tweets.concat(res.data.data.map(function (e) {
                            return {
                                likes: e.public_metrics.like_count,
                                comments: e.public_metrics.reply_count,
                                retweets: e.public_metrics.retweet_count,
                                date: (new Date(e.created_at)).getTime(),
                                id: e.id
                            };
                        }));
                        if (res.data.meta.next_token) {
                            urlNext = url + "&pagination_token=" + res.data.meta.next_token;
                        }
                        else {
                            keepRequesting = false;
                        }
                    }
                    catch (e) {
                        throw "got error reading tweets : " + e;
                    }
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, tweets];
            }
        });
    });
}
function getImpressions() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
exports.getImpressions = getImpressions;
//# sourceMappingURL=twitter.js.map