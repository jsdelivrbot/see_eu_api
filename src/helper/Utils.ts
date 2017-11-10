export class Utils {

    /*
     * String to Base64
     */
    static btoa(text: string) {
        return Buffer.from(text).toString('base64');
    }

    /*
     * Base64 to String
     */
    static atob(text: string) {
        return Buffer.from(text, 'base64').toString('ascii');
    }
}