"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("./Constants");
class CryptoHelper {
    static encrypt(text) {
        var cipher = this.crypto.createCipher(this.algorithm, this.password);
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }
    static decrypt(text) {
        var decipher = this.crypto.createDecipher(this.algorithm, this.password);
        var dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }
}
CryptoHelper.crypto = require('crypto');
CryptoHelper.algorithm = 'aes-256-ctr';
CryptoHelper.password = Constants_1.Constants.PROJECT_SECRET_KEY;
exports.CryptoHelper = CryptoHelper;
