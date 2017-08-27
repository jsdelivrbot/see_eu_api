import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { User } from '../models/user';

const USERS = "users";
export class UsersController {
    public static route: string = `/${USERS}`;
    public router: Router = Router();
    private db: Db;
    constructor(db: Db) {
        this.db = db;

        this.router.get('/', this.findUsers.bind(this));
        this.router.get('/:id', this.findUser.bind(this));
        this.router.post('/', this.createUser.bind(this));
        this.router.put('/:id', this.updateUser.bind(this));
        this.router.delete('/:id',this.deleteUser.bind(this))
    }

    private findUsers(req: Request, res: Response) {

        this.db
            .collection(USERS)
            .find().toArray()
            .then((users: User[]) => {
                res.status(200).send(users);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private findUser(req: Request, res: Response) {
        this.fetchUser(req.params.id)
            .then((user: User) => {
                res.status(200).send(user);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private fetchUser(userId:number):Promise<User>{
        return  this.db
            .collection(USERS)
            .findOne({id: userId });
    }

    private createUser(req: Request, res: Response) {
        req.body.id = (new Date()).valueOf().toString();
        this.db
            .collection(USERS)
            .insertOne(req.body)
            .then((response: InsertOneWriteOpResult) => {
                res.send(req.body.id);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    private updateUser(req: Request, res: Response) {
        delete req.body._id;
        this.db.collection(USERS)
            .updateOne({ id: req.params.id }, { $set: req.body })
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(400).send(err);
            })
    }

    private deleteUser(req:Request,res:Response){
        this.db.collection(USERS).deleteOne({id:req.params.id})
        .then(deleteResult=>res.send())
        .catch(error=>res.status(400).send(error));
    }
}