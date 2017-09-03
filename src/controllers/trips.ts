import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
//import { User } from '../models/user';

const TRIPS = "trips";
const TRIP_DETAILS = "tripDetails";

export class TripsController {
    public static route: string = `/${TRIPS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        this.router.post('/', this.post.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        // this.router.post('/', this.createUser.bind(this));
        // this.router.put('/:id', this.updateUser.bind(this));
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

    private getById(req: Request, res: Response) {
        this.db.collection(TRIPS).aggregate([
            {
                $match: {
                    id: req.params.id
                }
            },
            {
                $lookup: {
                    from: TRIP_DETAILS,
                    localField: "id",
                    foreignField: "tripId",
                    as: TRIP_DETAILS
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
                    discountEndDate: { $first: "$discountEndDate" },
                    startDate: { $first: "$startDate" },
                    endDate: { $first: "$endDate" },
                    tripDetails: { $first: "$tripDetails" },
                    pickupPoints: { $addToSet: "$pickupPoints" }
                }
            }
        ]).next()
            .then(trip => {
                res.send(trip);
            }).catch(err => res.status(500).send(err));
    }

}