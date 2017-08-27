import { Router, Request, Response, NextFunction, Express } from 'express';
import { Db, ObjectID, InsertWriteOpResult, InsertOneWriteOpResult } from 'mongodb';
import { Language } from './../models/language';
const LANGUAGES = "languages";
export class LanguagesController {
    router: Router = Router();
    public static route = `/${LANGUAGES}`;
    constructor(
        private db: Db
    ) {
        this.router.post("/", this.create.bind(this));
        this.router.put("/:id", this.update.bind(this));
        this.router.get("/", this.get.bind(this));
    }

    get(req: Request, res: Response) {
        this.db.collection(LANGUAGES).find().toArray().then((languages: Language[]) => {
            res.send(languages);
        })
            .catch(err => { res.send(400).send(err) });
    }
    create(req: Request, res: Response) {
        let language: Language = req.body;
        language.id = (new Date()).valueOf().toString();
        this.db.collection(LANGUAGES)
            .insertOne(language)
            .then((lng: InsertOneWriteOpResult) => {
                res.send(language);
            })
            .catch(err => { res.status(400).send(err) });
    }

    update(req: Request, res: Response) {
        delete req.body._id;
        let language: Language = req.body;
        this.db.collection(LANGUAGES).updateOne(
            {
                id: language.id
            }, 
            {
                $set: language
            })
            .then(() => res.send(language))
            .catch(err => res.status(500).send(err));
    }
}