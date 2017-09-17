import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Itinerary } from "../models/itinerary";
//import { User } from '../models/user';

const ITINERARY = "itinerary";
const ITINERARY_DETAILS = "itineraryDetails";

export class ItineraryController {
    public static route: string = `/${ITINERARY}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;
        this.router.post('/', this.post.bind(this));        
        this.router.get('/:id', this.getById.bind(this));
    }

    private post(req: Request, res: Response) {
        let itinerary = req.body;
        itinerary.id = (new Date()).valueOf().toString();
        this.db.collection(ITINERARY).insertOne(itinerary)
            .then((itry) => {
                res.status(200).send(itry)
            })
            .catch(err => res.status(403).send(err))
    }
    private getById(req: Request, res: Response) {
        this.db.collection(ITINERARY).aggregate([
            {
                $match: {
                    id: req.params.id
                }
            }
        ]).next()
            .then(itinerary => {
                res.send(itinerary);
            }).catch(err => res.status(500).send(err));
    }

}