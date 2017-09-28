import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Trip } from "../models/trip";
//import { User } from '../models/user';

const TRIPS = "trips";
const TRIP_DETAILS = "tripDetails";
const getFilterForLang = (languageId: string): any[] => {
    if (!languageId) { return []; }
    return [
        {
            $unwind: "$tripDetails"
        },
        {
            $match: {
                "tripDetails.languageId": languageId
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
            $project: {
                id: "$id",
                discountPercentage: "$discountPercentage",
                images: "$images",
                thumbnail: "$thumbnail",
                discountEndDate: "$discountEndDate",
                startDate: "$startDate",
                endDate: "$endDate",
                tripDetails: "$tripDetails",
                pickupPoints: {
                    "localityId": "$pickupPoints.localityId",
                    "price": "$pickupPoints.price",
                    "locality": {
                        $arrayElemAt: ["$pickupPoints.locality", 0]

                    }

                },
                variations: "$variations"
            }
        },
        {//this project will filter pickuppoint details based on language
            $project: {
                id: "$id",
                discountPercentage: "$discountPercentage",
                images: "$images",
                thumbnail: "$thumbnail",
                discountEndDate: "$discountEndDate",
                startDate: "$startDate",
                endDate: "$endDate",
                tripDetails: "$tripDetails",
                pickupPoints: {
                    "localityId": "$pickupPoints.localityId",
                    "price": "$pickupPoints.price",
                    "locality":
                    {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$pickupPoints.locality.details",
                                    as: "item",
                                    cond: { $eq: ["$$item.languageId", languageId] }
                                }
                            }, 0]
                    }

                },
                variations: "$variations"
            }

        },
        {
            $group: {
                _id: "$id",
                id: { $first: "$id" },
                discountPercentage: { $first: '$discountPercentage' },
                images: { $first: '$images' },
                thumbnail: { $first: '$thumbnail' },
                discountEndDate: { $first: "$discountEndDate" },
                startDate: { $first: "$startDate" },
                endDate: { $first: "$endDate" },
                tripDetails: { $first: "$tripDetails" },
                pickupPoints: { $addToSet: "$pickupPoints" },
                variations: { $first: '$variations' }
            }
        }

    ]
}


export class TripsController {
    public static route: string = `/${TRIPS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;
        this.router.get('/', this.get.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.put('/:id', this.put.bind(this));
        // this.router.delete('/:id', this.deleteUser.bind(this))

    }

    private post(req: Request, res: Response) {
        let trip = req.body;
        trip.id = (new Date()).valueOf().toString();
        this.db.collection(TRIPS).insertOne(trip)
            .then((trp) => {
                res.status(200).send(trip)
            })
            .catch(err => res.status(403).send(err))
    }

    private put(req: Request, res: Response) {
        delete req.body._id;
        let trip = req.body;
        this.db.collection(TRIPS).updateOne({
            id: trip.id
        }, { $set: trip })
            .then((trp) => {
                res.status(200).send(trip)
            })
            .catch(err => res.status(403).send(err))
    }
    private get(req: Request, res: Response) {
        this.db.collection(TRIPS).aggregate(
            getFilterForLang(req.query.lang)
        ).toArray()
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
            ...getFilterForLang(req.query.lang)
        ]).next()
            .then((trip: Trip) => {
                res.send(trip);
            }).catch(err => res.status(500).send(err));
    }


}