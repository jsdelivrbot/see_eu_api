"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    /*
     * String to Base64
     */
    static btoa(text) {
        return Buffer.from(text).toString('base64');
    }
    /*
     * Base64 to String
     */
    static atob(text) {
        return Buffer.from(text, 'base64').toString('ascii');
    }
}
exports.Utils = Utils;
