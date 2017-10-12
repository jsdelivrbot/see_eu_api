import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import { Variation } from "../models/variation";

const VARIATIONS = "variations";
export class VariationsController {
    public static route: string = `/${VARIATIONS}`;
    public router: Router = Router();
    constructor(private db: Db) {
        this.router.post('/', this.post.bind(this));
        this.router.get('/', this.get.bind(this));
        this.router.get('/:id', this.getById.bind(this));
    }

    post(req: Request, res: Response) {
        let variation = req.body as Variation;
        variation.id = (new Date()).valueOf().toString();
        this.db.collection(VARIATIONS).insertOne(variation)
            .then(response => res.send(variation))
            .catch(err => res.status(500).send(err));
    }

    put(req: Request, res: Response) {
        delete req.body._id;
        let variation: Variation = req.body;
        this.db.collection(VARIATIONS).updateOne({
            id: req.params.id
        }, { $set: variation })
            .then(response => res.send(variation))
            .catch(err => res.status(500).send(err));
    }

    get(req: Request, res: Response) {
        
        this.db.collection(VARIATIONS).aggregate([

            //...filterDetailsByLang,
            
            //...filterLabelInfoByLang,
            //...groupFieldsIfFilteredByLang
        ]).toArray()
            .then(variations => res.send(variations))
            .catch(err => res.status(500).send(err));
    }

    getById(req: Request, res: Response) {
        this.db.collection(VARIATIONS).findOne({
            id: req.params.id
        })
            .then(variation => res.send(variation))
            .catch(err => res.status(500).send(err));
    }
}