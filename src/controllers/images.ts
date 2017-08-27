import { Router, Request, Response, NextFunction, Express } from 'express';
import { Db, ObjectID, InsertWriteOpResult, InsertOneWriteOpResult } from 'mongodb';
import { Image } from '../models/image';
import * as multer from 'multer';
const IMAGES = "images";
const upload = multer({ dest: "uploads/" });

export class ImagesController {
    public static route: string = `/${IMAGES}`;
    public router: Router = Router();

    private db: Db;
    constructor(db: Db) {
        this.db = db;
        this.router.post('/', upload.single('image'), this.create.bind(this));
        this.router.post('/multiple', upload.any(), this.createMultiple.bind(this))
    }

    create(req: Request, res: Response, next: NextFunction) {
        let image: Image;
        image = {
            id: (new Date()).valueOf().toString(),
            dateCreated: new Date(),
            filename: req.file.filename,
            fileSize: req.file.size,
            path: req.file.path
        }
        this.db.collection(IMAGES).insertOne(image)
            .then((img: InsertOneWriteOpResult) => {
                res.status(200).send(image);
            })
            .catch(err => {
                res.status(400).send(err);
            })
    }

    createMultiple(req: Request, res: Response, next: NextFunction) {
        let files = (req.files as Express.Multer.File[]);
        let images: Array<Image> = new Array<Image>(files.length);
        for (let index = 0; index < files.length; index++){
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
            .then((img: InsertWriteOpResult) => {
                res.status(200).send(images);
            })
            .catch(err => {
                res.status(400).send(err);
            })
            
            
        
    }

}