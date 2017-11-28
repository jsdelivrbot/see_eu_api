"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../helper/Utils");
const TOKENS = "tokens";
//TODO: Added createdOn when adding a new token
class TokenManager {
    constructor(db) {
        this.db = db;
    }
    newToken(user) {
        var tokenExpiry = new Date();
        tokenExpiry.setDate(tokenExpiry.getDate() + 2);
        var token = Utils_1.Utils.btoa(user.email + '~' + user.id + '~' + tokenExpiry.getTime().toString());
        return token;
    }
    generateToken(user) {
        var token = this.newToken(user);
        var promise = new Promise((resolve, reject) => {
            this.db.collection(TOKENS).updateOne({ user: user }, { user: user, token: token }, { upsert: true })
                .then(() => {
                resolve(token);
            })
                .catch(() => {
                resolve(null);
            });
        });
        return promise;
    }
    isTokenValid(token) {
        var promise = new Promise((resolve, reject) => {
            var string = Utils_1.Utils.atob(token);
            if (Number(token.split('~'[2])) > Date.now()) {
                resolve(false);
            }
            this.db.collection(TOKENS).findOne({ token: token })
                .then((_token) => {
                resolve(_token != null);
            })
                .catch(() => {
                resolve(false);
            });
        });
        return promise;
    }
    refreshToken(oldToken) {
        var self = this;
        var promise = new Promise((resolve, reject) => {
            var updateToken = function (token) {
                var newToken = self.newToken(token.user);
                self.db.collection(TOKENS).updateOne({ token: token.token }, { $set: { token: newToken } })
                    .then(() => {
                    resolve(newToken);
                })
                    .catch(() => {
                    resolve(oldToken);
                });
            };
            var getTokenFromDB = function () {
                self.db.collection(TOKENS).findOne({ token: oldToken })
                    .then((token) => {
                    updateToken(token);
                })
                    .catch(() => {
                    resolve(oldToken);
                });
            };
            getTokenFromDB();
        });
        return promise;
    }
}
exports.TokenManager = TokenManager;
