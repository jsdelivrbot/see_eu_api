"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const USERS = "users";
class UsersController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.get('/', this.findUsers.bind(this));
        this.router.get('/:id', this.findUser.bind(this));
        this.router.post('/', this.createUser.bind(this));
        this.router.put('/:id', this.updateUser.bind(this));
        this.router.delete('/:id', this.deleteUser.bind(this));
    }
    findUsers(req, res) {
        this.db
            .collection(USERS)
            .find().toArray()
            .then((users) => {
            res.status(200).send(users);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    findUser(req, res) {
        this.fetchUser(req.params.id)
            .then((user) => {
            res.status(200).send(user);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    fetchUser(userId) {
        return this.db
            .collection(USERS)
            .findOne({ id: userId });
    }
    createUser(req, res) {
        req.body.id = (new Date()).valueOf().toString();
        this.db
            .collection(USERS)
            .insertOne(req.body)
            .then((response) => {
            res.send(req.body.id);
        }).catch(err => {
            res.status(400).send(err);
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
