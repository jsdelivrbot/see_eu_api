/*
 *  Abstract class that performs basic tasks of queuing and dispatching for Email, SMS and Push Notifications
 */

export abstract class MessageController {

    private queueHigh: Array<Object>;    //High priority queue
    public queueLow: Array<Object>;    //Low priority queue

    constructor() {
        this.queueHigh = new Array<Object>();
        this.queueLow = new Array<Object>();
    }

    public send(payload: Object) {
        if (payload['isPriority']) {
            this.queueHigh.push(payload);
        }
        else {
            this.queueLow.push(payload);
        }

        this.dispatch();
    }

    public payload() {
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

    public abstract dispatch();

    public dispatchComplete(payload) {
        if (payload['isPriority']) {
            this.queueHigh.splice(0, 1);
        }
        else {
            this.queueLow.splice(0, 1);
        }

        this.dispatch();
    }
}