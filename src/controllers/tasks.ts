import { Router, Request, Response } from 'express';
import { Db, ObjectID, InsertOneWriteOpResult } from 'mongodb';
import { Task } from '../models/task';
import { CustomerController } from './customers';
import { UsersController } from './users';

const TASKS = "tasks";
export class TasksController {
    public static route: string = `/${TASKS}`;
    public router: Router = Router();
    //private db: Db;
    constructor(private db: Db) {
        this.router.get('/', this.fetchAll.bind(this));
        this.router.get('/:id', this.findOne.bind(this));
        this.router.post('/', this.createTask.bind(this));
        this.router.put('/:id', this.updateTask.bind(this));
        this.router.delete('/:id', this.deleteTask.bind(this));
    }

    fetchAll(req: Request, res: Response) {
        let $this = this;
        this.db.collection(TASKS).aggregate(this.includeUserAndCustomer())
            .toArray()
            .then((tasks: Task[]) => {
                res.send(tasks);
            })
            .catch((err) =>
                res.status(400).send(err)
            );
    }


    findOne(req: Request, res: Response) {
        let $this = this;

        this.db.collection(TASKS).aggregate(
            [].concat(
                {
                    $match: {
                        id: req.params.id
                    }
                },
                this.includeUserAndCustomer()
            )
        ).next().then((task: Task) => {
            res.status(200).send(task);
        }).catch(err => {
            res.status(400).send(err);
        })
    }

    createTask(req: Request, res: Response) {
        let task: Task = req.body;
        task.id = (new Date()).valueOf().toString();
        this.db
            .collection(TASKS)
            .insertOne(task)
            .then((response: InsertOneWriteOpResult) => {
                res.send(task.id);
            }).catch(err => {
                res.status(400).send(err);
            })
    }

    updateTask(req: Request, res: Response) {
        delete req.body._id;
        let task: Task = req.body;

        this.db.collection(TASKS)
            .updateOne({ id: req.params.id }, { $set: task })
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(400).send(err);
            })
    }

    deleteTask(req: Request, res: Response) {
        this.db.collection(TASKS).deleteOne({ id: req.params.id })
            .then(deleteResult => res.send())
            .catch(error => res.status(400).send(error));
    }

    includeUserAndCustomer(): Object[] {
        return [
            {
                $lookup: {
                    from: "users",
                    localField: "assignedToId",
                    foreignField: "id",
                    as: "user"
                }
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "id",
                    as: "customer"
                }
            }
        ]
    }
}
