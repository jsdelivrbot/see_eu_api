import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Trip } from "../models/trip";
//import { User } from '../models/user';

const TRIPS = "trips";
const TRIP_DETAILS = "tripDetails";

export class TripsController {
    public static route: string = `/${TRIPS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;
        this.router.get('/', this.get.bind(this));        
        this.router.post('/', this.post.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        // this.router.post('/', this.createUser.bind(this));
        this.router.put('/:id', this.put.bind(this));
        // this.router.delete('/:id', this.deleteUser.bind(this))

    }

    private post(req: Request, res: Response) {
        let trip = req.body;
        trip.id = (new Date()).valueOf().toString();
        this.db.collection(TRIPS).insertOne(trip)
            .then((trp) => {
                res.status(200).send(trp)
            })
            .catch(err => res.status(403).send(err))
    }

    private put(req: Request, res: Response) {

    }
    private get(req: Request, res: Response) {
        this.db.collection(TRIPS).find().toArray()
            .then(trips => {
                res.send(trips);
            }).catch(err => res.status(500).send(err));
    }

    private getById(req: Request, res: Response) {
        this.db.collection(TRIPS).aggregate([
            {
                $match: {
                    id: req.params.id
                }
            },
            {
                $unwind: "$pickupPoints"
            },
            {
                $lookup: {
                    from: "localities",
                    localField: "pickupPoints.localityId",
                    foreignField: "id",
                    as: "pickupPoints.locality"
                }
            },
            {
                $group: {
                    _id: "$id",
                    discountPercentage: { $first: '$discountPercentage' },
                    images: { $first: '$images' },
                    discountEndDate: { $first: "$discountEndDate" },
                    startDate: { $first: "$startDate" },
                    endDate: { $first: "$endDate" },
                    tripDetails: { $first: "$tripDetails" },
                    pickupPoints: { $addToSet: "$pickupPoints" },
                    variation: {$first:'$variations'}
                }
            }
        ]).next()
            .then((trip: Trip) => {
                res.send(trip);
            }).catch(err => res.status(500).send(err));
    }

}