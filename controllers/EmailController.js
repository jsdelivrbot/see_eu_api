"use strict";
/*
 *  Dispatches emails using MailGun. https://www.mailgun.com/
 */
Object.defineProperty(exports, "__esModule", { value: true });
const MessageController_1 = require("./MessageController");
class EmailController extends MessageController_1.MessageController {
    constructor() {
        super();
    }
    static instance() {
        if (!EmailController._instance) {
            EmailController._instance = new EmailController();
        }
        return EmailController._instance;
    }
    dispatch() {
        var payload = this.payload();
        if (payload == null) {
            return;
        }
        var request = require('request');
        var options = {
            url: 'https://api:key-086e287ba15fa2ac9fd233c0f0a30eab@api.mailgun.net/v3/see-globe.com/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                from: payload['from'],
                to: payload['to'],
                subject: payload['subject'],
                html: payload['html']
                // html: this.emailHTML(payload)
            }
        };
        var thiz = this;
        request(options, function (error, response, body) {
            //TODO: Log response
            //TODO: Implement retry mechanism in case of failure
            //Assuming the email is sent
            thiz.dispatchComplete(payload);
        });
    }
}
exports.EmailController = EmailController;
