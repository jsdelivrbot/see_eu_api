"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PICK_POINTS = "pickuppoints";
class LanguagesController {
    constructor(db) {
        this.db = db;
        this.router = express_1.Router();
        this.router.post("/", this.create.bind(this));
    }
    create(req, res) {
        let pickupPoint = req.body;
        pickupPoint.id = (new Date()).valueOf().toString();
        this.db.collection(PICK_POINTS)
            .insertOne(pickupPoint)
            .then(() => {
            res.send(pickupPoint);
        })
            .catch(err => { res.status(500).send(err); });
    }
    update(req, res) {
        delete req.body._id;
        let pickupPoint = req.body;
        this.db.collection(PICK_POINTS)
            .updateOne({
            id: pickupPoint.id
        }, {
            $set: pickupPoint
        })
            .then(() => {
            res.send(pickupPoint);
        })
            .catch(err => { res.status(500).send(err); });
    }
}
LanguagesController.route = `/${PICK_POINTS}`;
exports.LanguagesController = LanguagesController;
