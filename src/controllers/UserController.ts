import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { User } from '../models/user';
import { EmailController } from './EmailController';
import { CryptoHelper } from '../helper/CryptoHelper';
import {Constants} from '../helper/Constants'
import {TokenManager} from '../helper/TokenManager'

const USERS = "users";

export class UserController {
    public static route: string = `/${USERS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        this.router.post('/login', this.login.bind(this));
        // this.router.get('/:id', this.findUser.bind(this));
        this.router.post('/', this.createUser.bind(this));
        this.router.put('/:id', this.updateUser.bind(this));
        this.router.delete('/:id', this.deleteUser.bind(this))
        this.router.get('/activate/:activationCode', this.activate.bind(this));
        this.router.get('/forgotPassword/:email', this.forgotPassword.bind(this));
        this.router.post('/resetPassword', this.resetPassword.bind(this));
        this.router.get('/validateResetPasswordCode/:resetCode', this.validateResetPasswordCode.bind(this));
    }

    private login(req: Request, res: Response) {
        // var tokenManager: TokenManager = new TokenManager(this.db);
        // tokenManager.isTokenValid('dml2ZWsubWVocmExQGdtYWlsLmNvbX4xNTA3NDM5OTE2MzYyfjE1MTA1MTUzMzM2OTE=')
        // .then((status: boolean) => {
        //     console.log('status: ' + status);
        //     tokenManager.refreshToken('dml2ZWsubWVocmExQGdtYWlsLmNvbX4xNTA3NDM5OTE2MzYyfjE1MTA1MTUzMzM2OTE=')
        //     .then((newToken) => {
        //         console.log('New Token Generated: ' + newToken);
        //     })
        //     res.send();
        // })
        // .catch((status: boolean) => {
        //     console.log(status);
        //     res.send();
        // });


        // return;

        let user: User = req.body;
        this.db.collection(USERS).findOne({
            email: user.email.toLowerCase(),
            password: user.password
        })
        .then((_user: User) => {
            if (_user.isActivated === false) {
                res.send({code: -1, message: 'Account is not activated. Please activate your account clicking on the activation URL send to your email'});
            }
            else {
                var tokenManager: TokenManager = new TokenManager(this.db);
                tokenManager.generateToken(_user)
                .then((token) => {
                    res.send({
                        code: 0, 
                        data: {
                            profile: {
                                id: _user.id,
                                firstName: _user.firstName,
                                lastName: _user.lastName,
                                dob: _user.dob,
                                mobile: _user.mobile,
                                gender: _user.gender,
                                email: _user.email,
                                avatar: _user.avatar
                            },
                            token: token
                        }});
                });
            }
        })
        .catch(err => res.send({code: -1, message: 'Invalid username or password', err: err.toString()}));
    }

    private activate(req: Request, res: Response) {
        var activationCode = req.params.activationCode;
        this.db.collection(USERS).findOne({
            activationCode: activationCode
        })
        .then((_user: User) => {
            if (!_user) {
                res.send({code: -1, message: 'Activation URL is invalid'});
            }
            else if (Number(activationCode.split('~'[1])) < Date.now()) {
                res.send({code: -1, message: 'Activation url has expired. Please register again'});
            }
            else if(_user.isActivated === true) {
                res.send({code: 0, message: 'Account already activated. You may now login'});
            }
            else {
                this.db.collection(USERS)
                .updateOne({email: _user.email}, {$set: {isActivated: true}})
                .then((data) => {
                    res.send({code: 0, message: 'Account is activated. You may now login'});
                })
                .catch((err) => {
                    res.send({code: -1, message: err.toString()});
                })
            }
        })
        .catch(err => {
            res.send({code: -1, message: err.toString()});
        })
    }

    private sendActivationEmail(activationCode, user) {
        var url = 'http://localhost:4500/#!/account-activation/' + activationCode;
        var emailController = EmailController.instance();
        emailController.send({
            from: 'admin@see-globe.com',
            to: user.email,
            subject: 'Account Created',
            html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><head><meta name="viewport" content="width=device-width" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>Account Activation</title><style type="text/css">img {max-width: 100%;}body {-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;}body {background-color: #f6f6f6;}@media only screen and (max-width: 640px) { body { padding: 0 !important; } h1 { font-weight: 800 !important; margin: 20px 0 5px !important; } h2 { font-weight: 800 !important; margin: 20px 0 5px !important; } h3 { font-weight: 800 !important; margin: 20px 0 5px !important; } h4 { font-weight: 800 !important; margin: 20px 0 5px !important; } h1 { font-size: 22px !important; } h2 { font-size: 18px !important; } h3 { font-size: 16px !important; } .container { padding: 0 !important; width: 100% !important; } .content { padding: 0 !important; } .content-wrap { padding: 10px !important; } .invoice { width: 100% !important; }}</style></head><body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><table class="body-wrap" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td><td class="container" width="600" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top"><div class="content" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;"><table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-wrap" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top"><meta itemprop="name" content="Confirm Email" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" /><table width="100%" cellpadding="0" cellspacing="0" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> Welcome ' + user.firstName + '! <br> Thank you for registering with SeeEU.</td></tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> To get started, please activate your account by clicking the below button.</td></tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"><a href="' + url + '" class="btn-primary" itemprop="url" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #348eda; margin: 0; border-color: #348eda; border-style: solid; border-width: 10px 20px;">Confirm email address</a> </td> </tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">If you didn\'t request this, you don\'t need to do anything.</td></tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">&mdash; SeeEU Group</td></tr></table></td></tr></table><div class="footer" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;"><table width="100%" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="aligncenter content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">Follow <a href="http://see-eu.info/" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;">SeeEU</a> on Twitter.</td></tr></table></div></div></td><td style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td></tr></table></body></html>',
            isPriority: true
        });
    }

    private createUser(req: Request, res: Response) {
        let $this = this;
        
        let user: User = req.body;
        user.email = user.email.toLowerCase();

        this.db.collection(USERS).findOne({
            email: user.email
        })
        .then((_user: User) => {
            var activationExpiry = new Date();
            activationExpiry.setDate(activationExpiry.getDate() + 2);
            var activationCode = CryptoHelper.encrypt(user.email + '~' + activationExpiry.getTime().toString());

            if (!_user) {   //User not registered
                user.id = (new Date()).valueOf().toString();
                user.isActivated = false;
                user.activationCode = activationCode;
                $this.db
                .collection(USERS)
                .insertOne(user)
                .then((response: InsertOneWriteOpResult) => {
                    $this.sendActivationEmail(activationCode, user);
                    res.send({code: 0, message: 'Thank you for registering. We\'ve sent you an email. Open it and activate your account' });
                }).catch(err => {
                    res.send({code: 0, message: err.toString()});
                })
            }
            else if(!_user.isActivated) {   //User registered but not activated
                user.activationCode = activationCode;
                $this.db
                .collection(USERS)
                .updateOne({email: user.email}, {$set: user})
                .then((response) => {
                    $this.sendActivationEmail(activationCode, user);
                    res.send({code: 0, message: 'Thank you for registering. We\'ve sent you an email. Open it and activate your account' });
                }).catch(err => {
                    res.send({code: -1, message: err.toString()});
                })
            }
            else {
                res.send({code: -1, message: 'User already registered'});
            }
        })
        .catch((err) => {
            res.send({code: 0, message: err.toString()});
        });
    }

    private forgotPassword(req: Request, res: Response) {
        var email = req.params.email.toLowerCase();

        this.db.collection(USERS).findOne({
            email: email
        })
        .then((_user: User) => {
            if (!_user) {
                res.send({code: -1, message: 'Email is not registered'});
            }
            else if (!_user.isActivated) {
                res.send({code: -1, message: 'Account is not activated. Please activate your account clicking on the activation URL send to your email'});
            }
            else {
                var resetExpiry = new Date();
                resetExpiry.setDate(resetExpiry.getDate() + 2);
                var resetCode = CryptoHelper.encrypt(email + '~' + resetExpiry.getTime().toString());

                _user.passwordResetCode = resetCode;

                this.db
                .collection(USERS)
                .updateOne({email: _user.email}, {$set: _user})
                .then((response) => {
                    var url = 'http://localhost:4500/#!/reset-password/' + resetCode;
                    var emailController = EmailController.instance();
                    emailController.send({
                        from: 'admin@see-globe.com',
                        to: email,
                        subject: 'Forgot Password',
                        html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><head><meta name="viewport" content="width=device-width" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>Forgot Password</title><style type="text/css">img {max-width: 100%;}body {-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;}body {background-color: #f6f6f6;}@media only screen and (max-width: 640px) {body {padding: 0 !important;}h1 {font-weight: 800 !important; margin: 20px 0 5px !important;}h2 {font-weight: 800 !important; margin: 20px 0 5px !important;}h3 {font-weight: 800 !important; margin: 20px 0 5px !important;}h4 {font-weight: 800 !important; margin: 20px 0 5px !important;}h1 {font-size: 22px !important;}h2 {font-size: 18px !important;}h3 {font-size: 16px !important;}.container {padding: 0 !important; width: 100% !important;}.content {padding: 0 !important;}.content-wrap {padding: 10px !important;}.invoice {width: 100% !important;}}</style></head><body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><table class="body-wrap" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td><td class="container" width="600" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top"><div class="content" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;"><table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-wrap" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top"><meta itemprop="name" content="Confirm Email" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" /><table width="100%" cellpadding="0" cellspacing="0" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">Dear ' + _user.firstName + '!<br>You recently requested to reset your password for your account. Use the button below to reset it.</td></tr></tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"><a href="' + url + '" class="btn-primary" itemprop="url" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #348eda; margin: 0; border-color: #348eda; border-style: solid; border-width: 10px 20px;">Reset Password</a></td></tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">If you didn\'t request this, you don\'t need to do anything.</td></tr><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">&mdash; SeeEU Group</td></tr></table></td></tr></table><div class="footer" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;"><table width="100%" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="aligncenter content-block" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">Follow <a href="http://twitter.com/mail_gun" style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;">@Mail_Gun</a> on Twitter.</td></tr></table></div></div></td><td style="font-family: \'Helvetica Neue\',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td></tr></table></body></html>',
                        isPriority: false
                    });
    
                    res.send({code: 0, message: 'We\'ve sent you an email. Open it to reset your password' });
                }).catch(err => {
                    res.send({code: -1, message: err.toString()});
                })
            }
        })
    }

    private validateResetPasswordCode(req: Request, res: Response) {
        var resetCode = req.params.resetCode;
        this.db.collection(USERS).findOne({
            passwordResetCode: resetCode
        })
        .then((_user: User) => {
            if (!_user) {
                res.send({code: -1, message: 'URL is invalid'});
            }
            else if (Number(resetCode.split('~'[1])) < Date.now()) {
                res.send({code: -1, message: 'Password reset url has expired'});
            }
            else {
                res.send({code: 0});
            }
        })
        .catch(err => {
            res.send({code: -1, message: err.toString()});
        })
    }

    private resetPassword(req: Request, res: Response) {
        var payload = req.body;

        if (payload.resetCode != null) {
            this.db.collection(USERS).findOne({
                passwordResetCode: payload.resetCode
            })
            //TODO: can also use findAndModify
            .then((_user: User) => {
                this.db.collection(USERS)
                .updateOne({passwordResetCode: req.body.resetCode}, {$set: {password: payload.password, passwordResetCode: null}})
                .then((data) => {
                    res.send({code: 0, message: 'Password reset successfully'});
                })
                .catch((err) => {
                    res.send({code: -1, message: err.toString()});
                })
                
            })
            .catch(err => {
                res.send({code: -1, message: err.toString()});
            })
        }
        else {
            if ('email' in payload == false) {
                res.json({code: -1, message: 'You need to login first'});
            }
            else if ('password' in payload == false) {
                res.json({code: -1, message: 'Enter password'});
            }
            else {
                this.db.collection(USERS).update(
                    {email: payload.email},
                    {$set: {password: payload.password}}
                )
                .then((_resp) => {
                    if (_resp.result.n != 0) {
                        res.json({code: 0, message: 'Password reset successfully'});
                    }
                    else {
                        res.json({code: -1, message: 'Unable to reset password'});
                    }
                })
                .catch(err => {
                    res.json({code: -1, message: err.toString()});
                })
            }
        }
    }

    private updateUser(req: Request, res: Response) {
        delete req.body._id;
        this.db.collection(USERS)
            .updateOne({ id: req.params.id }, { $set: req.body })
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(400).send(err);
            })
    }

    private deleteUser(req: Request, res: Response) {
        this.db.collection(USERS).deleteOne({ id: req.params.id })
            .then(deleteResult => res.send())
            .catch(error => res.status(400).send(error));
    }

    
    // private findUsers(req: Request, res: Response) {

    //     this.db
    //         .collection(USERS)
    //         .find().toArray()
    //         .then((users: User[]) => {
    //             res.status(200).send(users);
    //         }).catch(err => {
    //             res.status(400).send(err);
    //         })
    // }

    // private findUser(req: Request, res: Response) {
    //     this.fetchUser(req.params.id)
    //         .then((user: User) => {
    //             res.status(200).send(user);
    //         }).catch(err => {
    //             res.status(400).send(err);
    //         })
    // }

    // private fetchUser(userId: number): Promise<User> {
    //     return this.db
    //         .collection(USERS)
    //         .findOne({ id: userId });
    // }
}