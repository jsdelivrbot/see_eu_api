import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Itineraries } from '../models/itineraries';

const ITINERARIES = "itineraries";
const ITINERARY_DETAILS = "itineraryDetails";

export class ItinerariesController {
    public static route: string = `/${ITINERARIES}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        this.router.post('/', this.post.bind(this));
        this.router.get('/:id', this.getById.bind(this));
    }

    private post(req: Request, res: Response) {
        console.log(this.db);
        let itinerary = req.body;
        itinerary.id = (new Date()).valueOf().toString();
        itinerary.test = new Date();
        this.db.collection(ITINERARIES).insertOne(itinerary)
            .then((itry) => {
                res.status(200).send(itinerary)
            })
            .catch(err => res.status(403).send(err))
    }

    private getById(req: Request, res: Response) {
        this.db.collection(ITINERARIES).aggregate([
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