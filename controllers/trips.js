"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TRIPS = "trips";
const TRIP_DETAILS = "tripDetails";
const getFilterForLang = (languageId) => {
    if (!languageId) {
        return [];
    }
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
        {
            /*this project will filter pickuppoint details based on language*/
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
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$pickupPoints.locality.details",
                                    as: "item",
                                    cond: { $eq: ["$$item.languageId", languageId] }
                                }
                            }, 0
                        ]
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
    ];
};
const getActiveTrips = (getAllTrips) => {
    if (getAllTrips) {
        return [];
    }
    return [
        {
            $match: {
                startDate: {
                    $gt: new Date()
                }
            }
        },
        {
            $project: {
                id: "$id",
                discountPercentage: {
                    $cond: { if: { $gte: ["$discountEndDate", new Date()] }, then: "$discountPercentage", else: 0 }
                },
                images: "$images",
                thumbnail: "$thumbnail",
                discountEndDate: "$discountEndDate",
                startDate: "$startDate",
                endDate: "$endDate",
                tripDetails: "$tripDetails",
                pickupPoints: "$pickupPoints",
                variations: "$variations"
            }
        },
    ];
};
let filterDetailsByLang = [];
let filterLabelInfoByLang = [];
let groupFieldsIfFilteredByLang = [];
class TripsController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.get('/', this.get.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.put('/:id', this.put.bind(this));
        // this.router.delete('/:id', this.deleteUser.bind(this))
    }
    post(req, res) {
        req.body.id = (new Date()).valueOf().toString();
        let trip = req.body;
        this.populateDates(trip);
        this.db.collection(TRIPS).insertOne(trip)
            .then((trp) => {
            res.status(200).send(trip);
        })
            .catch(err => res.status(403).send(err));
    }
    populateDates(trip) {
        trip.discountEndDate = new Date(trip.discountEndDate);
        trip.endDate = new Date(trip.endDate);
        trip.startDate = new Date(trip.startDate);
    }
    put(req, res) {
        delete req.body._id;
        let trip = req.body;
        this.populateDates(trip);
        this.db.collection(TRIPS).updateOne({
            id: trip.id
        }, { $set: trip })
            .then((trp) => {
            res.status(200).send(trip);
        })
            .catch(err => res.status(403).send(err));
    }
    get(req, res) {
        let $this = this;
        var getAllTrips = req.query.all ? true : false;
        this.db.collection(TRIPS).aggregate([
            ...getActiveTrips(getAllTrips),
            ...getFilterForLang(req.query.lang),
        ]).toArray()
            .then((trips) => {
            trips.forEach(trip => {
                if (req.query.lang) {
                    this.simplifyVariations(trip, req.query.lang);
                }
            });
            res.send(trips);
        }).catch(err => res.status(500).send(err));
    }
    getById(req, res) {
        let $this = this;
        var getAllTrips = req.query.all ? true : false;
        this.db.collection(TRIPS).aggregate([
            {
                $match: {
                    id: req.params.id
                }
            },
            ...getActiveTrips(getAllTrips),
            ...getFilterForLang(req.query.lang)
        ]).next()
            .then((trip) => {
            if (req.query.lang) {
                this.simplifyVariations(trip, req.query.lang);
            }
            res.send(trip);
        }).catch(err => res.status(500).send(err));
    }
    simplifyVariations(trip, languageId) {
        this.simplifyTripDetails(trip, languageId);
        this.simplifyTripParams(trip, languageId);
    }
    simplifyTripDetails(trip, languageId) {
        if (trip && trip.variations) {
            trip.variations.map(variation => {
                if (variation.details) {
                    variation.details = variation.details.filter(detail => detail.languageId == languageId)[0];
                }
                return variation;
            });
        }
    }
    simplifyTripParams(trip, languageId) {
        //this method only filters variations of type 0 i.e. value based variations
        //which have labelInfo array in them
        if (trip.variations) {
            trip.variations.map(variation => {
                if (variation.params && variation.params.constructor == Array) {
                    variation.params.map(param => {
                        if (param.labelInfo && param.labelInfo.constructor == Array) {
                            param.labelInfo = param.labelInfo.filter(l => l.languageId == languageId)[0];
                        }
                    });
                }
                return variation;
            });
        }
    }
}
TripsController.route = `/${TRIPS}`;
exports.TripsController = TripsController;
