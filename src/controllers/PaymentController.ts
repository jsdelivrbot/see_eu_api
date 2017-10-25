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
                    itineraryId: req.body.itineraryId                    
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
                to: 'email.sahilkhanna@gmail.com',
                subject: 'Payment Received',
                html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><head><meta name="viewport" content="width=device-width" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>Payment</title><style type="text/css">img {max-width: 100%;}body {-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;}body {background-color: #f6f6f6;}@media only screen and (max-width: 640px) { body { padding: 0 !important; } h1 { font-weight: 800 !important; margin: 20px 0 5px !important; } h2 { font-weight: 800 !important; margin: 20px 0 5px !important; } h3 { font-weight: 800 !important; margin: 20px 0 5px !important; } h4 { font-weight: 800 !important; margin: 20px 0 5px !important; } h1 { font-size: 22px !important; } h2 { font-size: 18px !important; } h3 { font-size: 16px !important; } .container { padding: 0 !important; width: 100% !important; } .content { padding: 0 !important; } .content-wrap { padding: 10px !important; } .invoice { width: 100% !important; }}</style></head><body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><table class="body-wrap" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td><td class="container" width="600" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top"><div class="content" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;"><table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-wrap" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top"><meta itemprop="name" content="Confirm Email" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" /><table width="100%" cellpadding="0" cellspacing="0" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> Thank you!</td></tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> We have received your payment of &euro; ' + body.amount + '</td></tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">&mdash; SeeEU Group</td></tr></table></td></tr></table><div class="footer" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;"><table width="100%" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="aligncenter content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">Follow <a href="http://see-eu.info/" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;">@SeeEU</a> on Twitter.</td></tr></table></div></div></td><td style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td></tr></table></body></html>',
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
            var paymentMethod = '';
            switch (body.method) {
                case 'banktransfer': {
                    paymentMethod = 'Bank Transfer';
                    break;
                }
                case 'belfius': {
                    paymentMethod = 'Belfius Direct Net';
                    break;
                }
                case 'bitcoin': {
                    paymentMethod = 'Bitcoin';
                    break;
                }
                case 'creditcard directdebit': {
                    paymentMethod = 'Credit Card';
                    break;
                }
                case 'giftcard': {
                    paymentMethod = 'Gift Card';
                    break;
                }
                case 'ideal': {
                    paymentMethod = 'iDEAL';
                    break;
                }
                case 'kbc': {
                    paymentMethod = 'KBC/CBC Payment Button';
                    break;
                }
                case 'paypal': {
                    paymentMethod = 'PayPal';
                    break;
                }
                case 'paysafecard': {
                    paymentMethod = 'paysafecard';
                    break;
                }
                case 'sofort': {
                    paymentMethod = 'SOFORT Banking';
                    break;
                }
                default: {
                    paymentMethod = body.method;
                }
            }
            res.send({
                code: 0,
                data: {
                    status: body.status == 'paid',
                    method: paymentMethod,
                    amount: body.amount,
                    transactionId: body.id,
                    transactionDate: body.createdDatetime
                }
            });
        });
    }
}