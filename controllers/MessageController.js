"use strict";
/*
 *  Abstract class that performs basic tasks of queuing and dispatching for Email, SMS and Push Notifications
 */
Object.defineProperty(exports, "__esModule", { value: true });
class MessageController {
    constructor() {
        this.queueHigh = new Array();
        this.queueLow = new Array();
    }
    send(payload) {
        if (payload['isPriority']) {
            this.queueHigh.push(payload);
        }
        else {
            this.queueLow.push(payload);
        }
        this.dispatch();
    }
    payload() {
        if (this.queueHigh.length > 0) {
            return this.queueHigh[0];
        }
        else if (this.queueLow.length > 0) {
            return this.queueLow[0];
        }
        else {
            return null;
        }
    }
    dispatchComplete(payload) {
        if (payload['isPriority']) {
            this.queueHigh.splice(0, 1);
        }
        else {
            this.queueLow.splice(0, 1);
        }
        this.dispatch();
    }
}
exports.MessageController = MessageController;
