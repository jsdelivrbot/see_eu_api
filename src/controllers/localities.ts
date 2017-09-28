import { Request, Response, Router } from 'express';
import { Db } from 'mongodb';
import { Locality } from './../models/locality';

const LOCALITIES = "localities";

export class LocalitiesController {
    public router: Router = Router();

    public static route = `/${LOCALITIES}`;

    constructor(
        private db: Db
    ) {
        this.router.post('/', this.create.bind(this));
        this.router.put('/:id', this.update.bind(this));
        this.router.get("/",this.get.bind(this))
    }

    get(req: Request, res: Response) {
        let filterDetailsByLang = [];
        let projectDetailsAsObject = [];
        if(req.query.lang){
            filterDetailsByLang = [
                {
                    $match:{
                        "details.languageId":req.query.lang
                    }
                }
        ];
        projectDetailsAsObject = [
            {
                $project:{
                    id:"$id",
                    details:{$arrayElemAt:["$details",0]}
                }
            }
        ]
        }
        this.db.collection(LOCALITIES).aggregate([
            {
                $unwind:"$details"
            },
            ...filterDetailsByLang,
            {
                $lookup: {
                    from: 'languages',
                    localField: 'details.languageId',
                    foreignField: 'id',
                    as: 'details.language'
                }
            },
            {//convert language array to object
                $project:{
                    id:"$id",
                    details:{
                        name:"$details.name",
                        languageId:"$details.languageId",
                        language:{
                            $arrayElemAt:["$details.language",0]
                        }
                    }
                }
            },
            {
                $group:{
                    _id:"$id",
                    id:{$first:"$id"},
                    details:{
                        $addToSet:"$details"
                    } 
                }
            },
            ...projectDetailsAsObject
        ]).toArray().then((localities) => {
            localities.forEach(l => l.language = l.language ? l.language[0] : null);
            res.send(localities);
        }).catch(err => res.status(500).send(err));
    }


    create(req: Request, res: Response) {
        let locality: Locality = req.body;
        locality.id = (new Date()).valueOf().toString();

        this.db.collection(LOCALITIES).insertOne(locality)
            .then(() => {
                res.send(locality);
            })
            .catch(err => {
                res.status(400).send(err);
            })
    }

    update(req: Request, res: Response) {
        delete req.body._id;
        let locality: Locality = req.body;

        this.db.collection(LOCALITIES).updateOne({
            id: req.params.id
        }, { $set: locality })
            .then(() => {
                res.send(locality);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    }

    delete(req: Request, res: Response) {
        this.db.collection(LOCALITIES).deleteOne({
            id: req.params.id
        })
            .then(() => { res.status(200).send() })
            .catch((err) => res.status(500).send(err));
    }

}