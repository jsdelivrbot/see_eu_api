export class CryptoHelper {
    
    private static crypto = require('crypto');
    private static algorithm = 'aes-256-ctr';
    private static password = 'SeeEU_Globe';
    
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