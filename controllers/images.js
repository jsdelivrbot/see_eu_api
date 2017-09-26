"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer = require("multer");
const IMAGES = "images";
const upload = multer({ dest: "uploads/" });
class ImagesController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.post('/', upload.single('image'), this.create.bind(this));
        this.router.post('/multiple', upload.any(), this.createMultiple.bind(this));
    }
    create(req, res, next) {
        let image;
        image = {
            id: (new Date()).valueOf().toString(),
            dateCreated: new Date(),
            filename: req.file.filename,
            fileSize: req.file.size,
            path: req.file.path
        };
        this.db.collection(IMAGES).insertOne(image)
            .then((img) => {
            res.status(200).send(image);
        })
            .catch(err => {
            res.status(400).send(err);
        });
    }
    createMultiple(req, res, next) {
        let files = req.files;
        let images = new Array(files.length);
        for (let index = 0; index < files.length; index++) {
            let file = files[index];
            images[index] = {
                id: (new Date()).valueOf().toString(),
                dateCreated: new Date(),
                filename: file.filename,
                fileSize: file.size,
                path: file.path
            };
        }
        this.db.collection(IMAGES).insertMany(images)
            .then((img) => {
            res.status(200).send(images);
        })
            .catch(err => {
            res.status(400).send(err);
        });
    }
}
ImagesController.route = `/${IMAGES}`;
exports.ImagesController = ImagesController;
