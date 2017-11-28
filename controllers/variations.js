"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VARIATIONS = "variations";
class VariationsController {
    constructor(db) {
        this.db = db;
        this.router = express_1.Router();
        this.router.post('/', this.post.bind(this));
        this.router.get('/', this.get.bind(this));
        this.router.get('/:id', this.getById.bind(this));
    }
    post(req, res) {
        let variation = req.body;
        variation.id = (new Date()).valueOf().toString();
        this.db.collection(VARIATIONS).insertOne(variation)
            .then(response => res.send(variation))
            .catch(err => res.status(500).send(err));
    }
    put(req, res) {
        delete req.body._id;
        let variation = req.body;
        this.db.collection(VARIATIONS).updateOne({
            id: req.params.id
        }, { $set: variation })
            .then(response => res.send(variation))
            .catch(err => res.status(500).send(err));
    }
    get(req, res) {
        this.db.collection(VARIATIONS).aggregate([]).toArray()
            .then(variations => res.send(variations))
            .catch(err => res.status(500).send(err));
    }
    getById(req, res) {
        this.db.collection(VARIATIONS).findOne({
            id: req.params.id
        })
            .then(variation => res.send(variation))
            .catch(err => res.status(500).send(err));
    }
}
VariationsController.route = `/${VARIATIONS}`;
exports.VariationsController = VariationsController;
