"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LOCALITIES = "localities";
class LocalitiesController {
    constructor(db) {
        this.db = db;
        this.router = express_1.Router();
        this.router.post('/', this.create.bind(this));
        this.router.put('/:id', this.update.bind(this));
    }
    get(req, res) {
        this.db.collection(LOCALITIES).aggregate([
            {
                $lookup: {
                    from: 'languages',
                    localField: 'languageId',
                    foreignField: 'id',
                    as: 'language'
                }
            }
        ]).toArray().then((localities) => {
            localities.forEach(l => l.language = l.language ? l.language[0] : null);
            res.send(localities);
        })
            .catch(err => res.status(500).send(err));
    }
    create(req, res) {
        let locality = req.body;
        locality.id = (new Date()).valueOf().toString();
        this.db.collection(LOCALITIES).insertOne(locality)
            .then(() => {
            res.send(locality);
        })
            .catch(err => {
            res.status(400).send(err);
        });
    }
    update(req, res) {
        delete req.body._id;
        let locality = req.body;
        this.db.collection(LOCALITIES).updateOne({
            id: req.params.id
        }, { $set: locality })
            .then(() => {
            res.send(locality);
        })
            .catch(err => {
            res.status(500).send(err);
        });
    }
    delete(req, res) {
        this.db.collection(LOCALITIES).deleteOne({
            id: req.params.id
        })
            .then(() => { res.status(200).send(); })
            .catch((err) => res.status(500).send(err));
    }
}
LocalitiesController.route = `/${LOCALITIES}`;
exports.LocalitiesController = LocalitiesController;
