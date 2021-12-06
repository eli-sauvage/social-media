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
exports.getFollowers = exports.getStats = void 0;
var sqlConnection_1 = require("./sqlConnection");
var axios_1 = require("axios");
function getStats() {
    return __awaiter(this, void 0, void 0, function () {
        var token, _a, shares, ugc, followers, posts, likesComment;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, sqlConnection_1.getToken)(1).catch(function (e) { debugger; })];
                case 1:
                    token = _b.sent();
                    return [4 /*yield*/, Promise.all([getShares(token), getUgc(token), getFollowers(token)]).catch(function (e) { throw e; })];
                case 2:
                    _a = _b.sent(), shares = _a[0], ugc = _a[1], followers = _a[2];
                    ugc = ugc.filter(function (e) { return !shares.map(function (e) { return e.date; }).includes(e.date); }); //retirer doublons
                    posts = shares.concat(ugc);
                    return [4 /*yield*/, getLikesComments(token, posts)];
                case 3:
                    likesComment = _b.sent();
                    return [2 /*return*/, {
                            followerCount: followers,
                            posts: posts
                        }];
            }
        });
    });
}
exports.getStats = getStats;
function getShares(token) {
    return __awaiter(this, void 0, void 0, function () {
        function getData(url) {
            return __awaiter(this, void 0, void 0, function () {
                var response, data, nextlink;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, axios_1.default.get(url, {
                                headers: {
                                    "Authorization": "Bearer ".concat(token)
                                }
                            }).catch(function (e) { throw "error getting linkedin shares : " + e; })];
                        case 1:
                            response = _a.sent();
                            data = response.data;
                            posts = posts.concat(data.elements);
                            nextlink = data.paging.links.filter(function (e) { return e.rel == "next"; })[0];
                            if (!nextlink) return [3 /*break*/, 3];
                            return [4 /*yield*/, getData("https://api.linkedin.com" + nextlink.href)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        var posts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    posts = [];
                    return [4 /*yield*/, getData("https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:9428607&sortBy=LAST_MODIFIED&sharesPerOwner=500&start=0&count=50")
                        // return posts
                    ];
                case 1:
                    _a.sent();
                    // return posts
                    return [2 /*return*/, posts.map(function (e) { return { id: e.activity, date: e.created.time, likes: 0, comments: 0 }; })];
            }
        });
    });
}
function getUgc(token) {
    return __awaiter(this, void 0, void 0, function () {
        function getData(url) {
            return __awaiter(this, void 0, void 0, function () {
                var response, data, nextlink;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, axios_1.default.get(url, {
                                headers: {
                                    "Authorization": "Bearer ".concat(token),
                                    "X-Restli-Protocol-Version": "2.0.0"
                                }
                            }).catch(function (e) { throw "error getting linkedin ugc : " + e; })];
                        case 1:
                            response = _a.sent();
                            data = response.data;
                            posts = posts.concat(data.elements);
                            nextlink = data.paging.links.filter(function (e) { return e.rel == "next"; })[0];
                            if (!nextlink) return [3 /*break*/, 3];
                            return [4 /*yield*/, getData("https://api.linkedin.com" + nextlink.href)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        var posts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    posts = [];
                    return [4 /*yield*/, getData("https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aorganization%3A9428607)&sortBy=LAST_MODIFIED&count=50")
                        // return posts
                    ];
                case 1:
                    _a.sent();
                    // return posts
                    return [2 /*return*/, posts.filter(function (e) { return e.lifecycleState == "PUBLISHED"; }).map(function (e) { return { id: e.id, date: e.created.time, likes: 0, comments: 0 }; })];
            }
        });
    });
}
function getLikesComments(token, posts) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, likesComments, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.linkedin.com/v2/socialActions?";
                    posts.forEach(function (post) { return url += "ids=" + post.id + "&"; });
                    return [4 /*yield*/, axios_1.default.get(url, { headers: { "Authorization": "Bearer ".concat(token) } }).catch(function (e) { throw "error getting linkedin likesComments" + e; })];
                case 1:
                    response = _a.sent();
                    try {
                        likesComments = response.data.results;
                        for (i = 0; i < posts.length; i++) {
                            posts[i].likes = likesComments[posts[i].id].likesSummary.totalLikes;
                            posts[i].comments = likesComments[posts[i].id].commentsSummary.aggregatedTotalComments;
                        }
                    }
                    catch (e) {
                        throw "got error reading linkedIn likesComments" + e;
                    }
                    return [2 /*return*/, posts];
            }
        });
    });
}
function getFollowers(apiToken) {
    return __awaiter(this, void 0, void 0, function () {
        var url, follows, followerCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:9428607";
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: {
                                "Authorization": "Bearer ".concat(apiToken)
                            }
                        }).catch(function (e) { throw "error getting linkedin followers : " + e; })];
                case 1:
                    follows = _a.sent();
                    try {
                        followerCount = follows.data.elements[0].followerCountsByAssociationType[0].followerCounts.organicFollowerCount; //non-employees
                        followerCount += follows.data.elements[0].followerCountsByAssociationType[1].followerCounts.organicFollowerCount; //employees
                    }
                    catch (e) {
                        throw "error reading linkedIn followers : " + e;
                    }
                    return [2 /*return*/, followerCount];
            }
        });
    });
}
exports.getFollowers = getFollowers;
//# sourceMappingURL=linkedin.js.map