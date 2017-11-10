import {Constants} from './Constants';

export class CryptoHelper {
    
    private static crypto = require('crypto');
    private static algorithm = 'aes-256-ctr';
    private static password = Constants.PROJECT_SECRET_KEY;
    
    static encrypt(text: String) {
        var cipher = this.crypto.createCipher(this.algorithm, this.password)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    }

    static decrypt(text: String) {
        var decipher = this.crypto.createDecipher(this.algorithm, this.password)
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }
}