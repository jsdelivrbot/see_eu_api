"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const USERS = "users";
class UsersController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.post('/login', this.login.bind(this));
        // this.router.get('/:id', this.findUser.bind(this));
        this.router.post('/', this.createUser.bind(this));
        this.router.put('/:id', this.updateUser.bind(this));
        this.router.delete('/:id', this.deleteUser.bind(this));
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
