import {User} from '../models/user';
import {Token} from '../models/Token';
import {Utils} from '../helper/Utils';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';

const TOKENS = "tokens";

//TODO: Added createdOn when adding a new token
export class TokenManager {

    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    private newToken(user: User) {
        var tokenExpiry: Date = new Date();
        tokenExpiry.setDate(tokenExpiry.getDate() + 2);
        var token: string = Utils.btoa(user.email + '~' + user.id + '~' + tokenExpiry.getTime().toString());
        return token;
    }

    generateToken(user: User) {
        var token: string = this.newToken(user);
        var promise: Promise<string> = new Promise((resolve, reject) => {
            this.db.collection(TOKENS).updateOne({user: user}, {user: user, token: token}, {upsert: true})
            .then(() => {
                resolve(token);
            })
            .catch(() => {
                resolve(null);
            });
        });
        return promise;
    }

    isTokenValid(token: string) {
        var promise: Promise<boolean> = new Promise((resolve, reject) => {
            var string: String = Utils.atob(token);
    
            if (Number(token.split('~'[2])) > Date.now()) {
                resolve(false);
            }

            this.db.collection(TOKENS).findOne({token: token})
            .then((_token: Token) => {
                resolve(_token != null);
            })
            .catch(() => {
                resolve(false);
            });
        });

        return promise;
    }

    refreshToken(oldToken: string) {
        var self = this;
        var promise: Promise<string> = new Promise((resolve, reject) => {

            var updateToken = function(token: Token) {
                var newToken: string = self.newToken(token.user);
                self.db.collection(TOKENS).updateOne({token: token.token}, {$set: {token: newToken}})
                .then(() => {
                    resolve(newToken);
                })
                .catch(() => {
                    resolve(oldToken);
                });
            };
    
            var getTokenFromDB = function() {
                self.db.collection(TOKENS).findOne({token: oldToken})
                .then((token: Token) => {
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