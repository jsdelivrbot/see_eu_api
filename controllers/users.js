"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EmailController_1 = require("./EmailController");
const CryptoHelper_1 = require("../helper/CryptoHelper");
const USERS = "users";
/* TODO */
// Create a user and mark it as inactive
// Send activation url on email
// Clicking activation link will extract the email from URL and check if the unactivated email exists in DB
// If exists, account will be activated
class UsersController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.post('/login', this.login.bind(this));
        // this.router.get('/:id', this.findUser.bind(this));
        this.router.post('/', this.createUser.bind(this));
        this.router.put('/:id', this.updateUser.bind(this));
        this.router.delete('/:id', this.deleteUser.bind(this));
        this.router.get('/activate/:uid', this.activate.bind(this));
    }
    login(req, res) {
        let user = req.body;
        this.db.collection(USERS).findOne({
            email: new RegExp(user.email, "i"),
            password: user.password
        })
            .then((usr) => {
            res.status(200).send(usr);
        })
            .catch(err => res.status(403).send(err));
    }
    activate(req, res) {
        // Clicking activation link will extract the email from URL and check if the unactivated email exists in DB
        // If exists, account will be activated
        var email = CryptoHelper_1.CryptoHelper.decrypt(req.params.uid);
        var emailController = EmailController_1.EmailController.instance();
        emailController.send({
            from: 'admin@see-globe.com',
            to: email,
            subject: 'Account Created',
            html: '<html><body>Your account <strong>' + CryptoHelper_1.CryptoHelper.decrypt(req.params.uid) + '</strong> is verified<body></html>',
            isPriority: true
        });
        res.send('Your account <strong>' + CryptoHelper_1.CryptoHelper.decrypt(req.params.uid) + '</strong> is verified');
    }
    createUser(req, res) {
        let user = req.body;
        let $this = this;
        user.id = (new Date()).valueOf().toString();
        this.db.collection(USERS).findOne({
            email: new RegExp(user.email, "i")
        })
            .then(() => {
            res.status(409).send({ message: "User already exists with this email" });
        })
            .catch(() => {
            $this.db
                .collection(USERS)
                .insertOne(user)
                .then((response) => {
                // Create a user and mark it as inactive
                // Send activation url on email
                var url = 'http://localhost:5000/users/activate/' + CryptoHelper_1.CryptoHelper.encrypt(user.email);
                var emailController = EmailController_1.EmailController.instance();
                emailController.send({
                    from: 'admin@see-globe.com',
                    to: user.email,
                    subject: 'Account Created',
                    html: '<html><body>Thank you for registering with us. Please activate account by clicking on the below URL<br><br>' + url + '<body></html>',
                    isPriority: true
                });
                res.send(req.body.id);
            }).catch(err => {
                res.status(400).send(err);
            });
        });
    }
    updateUser(req, res) {
        delete req.body._id;
        this.db.collection(USERS)
            .updateOne({ id: req.params.id }, { $set: req.body })
            .then((data) => {
            res.send(data);
        })
            .catch((err) => {
            res.status(400).send(err);
        });
    }
    deleteUser(req, res) {
        this.db.collection(USERS).deleteOne({ id: req.params.id })
            .then(deleteResult => res.send())
            .catch(error => res.status(400).send(error));
    }
}
UsersController.route = `/${USERS}`;
exports.UsersController = UsersController;
