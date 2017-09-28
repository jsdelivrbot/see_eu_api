/*
 *  Class to interact with Payment Gateway. The currently used payment gatewau is Mollie. https://www.mollie.com/en/
 * TODO: Create a Webhook URL and dispatch email when the Payment Gateway posts to the Webhook URL
 */
import { Router, Request, Response } from 'express';
import { EmailController } from './EmailController';

const PAYMENT = "payment";
const PAYMENT_STATUS = "paymentStatus";

export class PaymentController {

    public static route: string = `/${PAYMENT}`;
    public router: Router = Router();

    constructor() {
        this.router.post('/', this.requestPayment.bind(this));
        this.router.get('/paymentStatus/:id', this.paymentStatus.bind(this));
    }

    /*
     * Begins the payment process
     */
    private requestPayment(req: Request, res: Response) {
        var request = require('request');
        var headers = {
            'Authorization':       'Bearer test_A2aknc4MCC6P3m5feqHcFrzeF3nUgs',
            'Content-Type':     'application/x-www-form-urlencoded'
        };

        var options = {
            url: 'https://api.mollie.nl/v1/payments',
            method: 'POST',
            headers: headers,
            form: {
                amount: req.body.amount,
                description: req.body.description,
                redirectUrl: 'http://localhost:4500/#!/payment-status',
                metadata: {
                    tripId: req.body.tripId,
                    customerId: req.body.customerId
                }
            }
        };

        request(options, function (error, response, body) {
            var body = JSON.parse(body);
            if (!error && response.statusCode == 201) {
                res.send({
                    code: 0,
                    data: {
                        paymentId: body.id,
                        paymentUrl: body.links.paymentUrl
                    }
                });
            }
            else {
                res.send({
                    code: response.statusCode,
                    message: body.error.message
                });
            }
        });
    }

    /*
     *  fetches the payment status
     */
    private paymentStatus(req: Request, res: Response) {
        var request = require('request');
        var headers = {
            'Authorization':       'Bearer test_A2aknc4MCC6P3m5feqHcFrzeF3nUgs'
        };

        var options = {
            url: 'https://api.mollie.nl/v1/payments/' + req.params.id,
            method: 'GET',
            headers: headers
        };

        request(options, function (error, response, body) {
            body = JSON.parse(body);

            var emailController = EmailController.instance();
            emailController.send({
                from: 'admin@see-globe.com',
                to: 'email.sahilkhanna@gmail.com, vivek.mehra1@gmail.com, crohit92@gmail.com',
                subject: 'Payment Received',
                html: '<html><body>We have received your payment of Euro <strong>' + body.amount + '</strong><body></html>',
                isPriority: true
            });
            
            //TODO: Save data to DB. Get details from body
            /*
                id: payment id,
                mode: test or live
                createdDatetime: The payment's date and time of creation
                status: open, cancelled, expired, failed, pending, paid, paidout, refunded, charged_back
                paidDatetime: The date and time the payment became paid
                amount: in EURO
                method: creditcard, sofort, ideal, mistercash, banktransfer, directdebit, paypal, bitcoin, podiumcadeaukaart, paysafecard, kbc, belfius, giftcard
                metadata: .tripId and .customerId,
                failureReason: invalid_card_number, invalid_cvv, invalid_card_holder_name, card_expired, invalid_card_type, refused_by_issuer, insufficient_funds, inactive_card
            */
            res.send({
                code: 0,
                data: {
                    status: body.status,
                    method: body.method,
                    amount: body.amount
                }
            });
        });
    }
}