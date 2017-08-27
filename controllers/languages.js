"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LANGUAGES = "languages";
class LanguagesController {
    constructor(db) {
        this.db = db;
        this.router = express_1.Router();
        this.router.post("/", this.create.bind(this));
        this.router.put("/:id", this.update.bind(this));
        this.router.get("/", this.get.bind(this));
    }
    get(req, res) {
        this.db.collection(LANGUAGES).find().toArray().then((languages) => {
            res.send(languages);
        })
            .catch(err => { res.send(400).send(err); });
    }
    create(req, res) {
        let language = req.body;
        language.id = (new Date()).valueOf().toString();
        this.db.collection(LANGUAGES)
            .insertOne(language)
            .then((lng) => {
            res.send(language);
        })
            .catch(err => { res.status(400).send(err); });
    }
    update(req, res) {
        delete req.body._id;
        let language = req.body;
        this.db.collection(LANGUAGES).updateOne({
            id: language.id
        }, {
            $set: language
        })
            .then(() => res.send(language))
            .catch(err => res.status(500).send(err));
    }
}
LanguagesController.route = `/${LANGUAGES}`;
exports.LanguagesController = LanguagesController;
