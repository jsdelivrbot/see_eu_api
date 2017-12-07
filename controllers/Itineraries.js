"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ITINERARIES = "itineraries";
const ITINERARY_DETAILS = "itineraryDetails";
class ItinerariesController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.post('/', this.post.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.get('/itineraries/:id', this.itineraries.bind(this));
    }
    post(req, res) {
        let itinerary = req.body;
        itinerary.id = (new Date()).valueOf().toString();
        itinerary.test = new Date();
        this.db.collection(ITINERARIES).insertOne(itinerary)
            .then((itry) => {
            res.status(200).send(itinerary);
        })
            .catch(err => res.status(403).send(err));
    }
    getById(req, res) {
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
    itineraries(req, res) {
        let itineraries = [];
        let currentPassengerCount = 0;
        this.db.collection(ITINERARIES).find().toArray()
            .then((_itineraries) => {
            let currentItineraryCount = 0;
            const nextItinerary = () => {
                if (currentItineraryCount < _itineraries.length) {
                    let _itinerary = _itineraries[currentItineraryCount];
                    let itinerary = {
                        passengers: [],
                        trip: {}
                    };
                    _itinerary['itineraryDetails'].forEach(_itineraryDetail => {
                        itinerary.passengers.push({
                            name: _itineraryDetail['name'],
                            gender: _itineraryDetail['gender'],
                            pickupPoint: _itineraryDetail['pickupPoint']['locality']['name'],
                            price: _itineraryDetail['pickupPoint']['price']
                        });
                    });
                    console.log(_itinerary.tripId);
                    this.db.collection('trips').findOne({
                        'id': _itinerary.tripId
                    })
                        .then(__itinerary => {
                        console.log('__itinerary: ' + __itinerary);
                        itinerary.trip = {
                            id: __itinerary['_id'],
                            name: __itinerary['tripDetails'][0]['name'],
                            description: __itinerary['tripDetails'][0]['description']
                        };
                        itineraries.push(itinerary);
                        currentItineraryCount++;
                        nextItinerary();
                    });
                }
                else {
                    res.json({ code: 0, data: itineraries });
                }
            };
            nextItinerary();
        })
            .catch(_err => {
            res.send({ code: -1, message: _err.toString() });
        });
    }
}
ItinerariesController.route = `/${ITINERARIES}`;
exports.ItinerariesController = ItinerariesController;
