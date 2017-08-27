import { Router, Request, Response, NextFunction, Express } from 'express';
import { Db } from 'mongodb';
import { PickupPoint } from './../models/pickupPoint';

const PICK_POINTS = "pickuppoints";

export class LanguagesController {
    router: Router = Router();
    public static route = `/${PICK_POINTS}`;
    constructor(
        private db: Db
    ) {
        this.router.post("/", this.create.bind(this));

    }

    create(req: Request, res: Response) {
        let pickupPoint: PickupPoint = req.body;
        pickupPoint.id = (new Date()).valueOf().toString();
        this.db.collection(PICK_POINTS)
            .insertOne(pickupPoint)
            .then(() => {
                res.send(pickupPoint);
            })
            .catch(err => { res.status(500).send(err) });
    }

    update(req: Request, res: Response) {
        delete req.body._id;
        let pickupPoint: PickupPoint = req.body;

        this.db.collection(PICK_POINTS)
            .updateOne(
            {
                id: pickupPoint.id
            },
            {
                $set: pickupPoint
            })
            .then(() => {
                res.send(pickupPoint);
            })
            .catch(err => { res.status(500).send(err) });
    }

}