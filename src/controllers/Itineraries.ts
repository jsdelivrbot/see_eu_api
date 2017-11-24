import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Itineraries } from '../models/itineraries';
import { ItineraryDetail } from '../models/itinerary-detail';
import { totalmem } from 'os';
import { resolve } from 'url';

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
        this.router.get('/itineraries/:id', this.itineraries.bind(this));
    }

    private post(req: Request, res: Response) {
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

    private itineraries(req: Request, res: Response) {
        let itineraries = [];
        let currentPassengerCount = 0;
        
        this.db.collection(ITINERARIES).find().toArray()
        .then((_itineraries: Itineraries[]) => {

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
                            name: __itinerary['tripDetails'][0]['name'],
                            description: __itinerary['tripDetails'][0]['description']
                        }
                        itineraries.push(itinerary);
                        currentItineraryCount++;
                        nextItinerary();
                    });
                }
                else {
                    res.json({code: 0, data: itineraries});
                }
            }

            nextItinerary();
        })
        .catch(_err => {
            res.send({code: -1, message: _err.toString()})
        });
    }

    // private itineraries(req: Request, res: Response) {
    //     //TODO: Add filter of userid
    //     this.db.collection(ITINERARIES).aggregate([{
    //         $lookup: {
    //             from: "trips",
    //             localField: "tripId",
    //             foreignField: "id",
    //             as: "trip"
    //         }
    //     }]).toArray()
    //     .then((itineraries: Itineraries[]) => {
    //         console.log(itineraries[0].itineraryDetails[0].pickupPoint.localityId);
    //         res.send({code: 0, data: itineraries});
    //     })
    //     .catch(err => {
    //         res.send({code: 4000, message: err.toString()})
    //     });
    //     // this.db.collection(ITINERARIES).find().toArray()
    //     // .then((itineraries: Itineraries[]) => {
    //     //     res.send({code: 0, data: itineraries});
    //     // })
    //     // .catch(err => {
    //     //     res.send({code: 4000, message: err.toString()})
    //     // });
    // }
}