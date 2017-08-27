"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TASKS = "tasks";
class TasksController {
    //private db: Db;
    constructor(db) {
        this.db = db;
        this.router = express_1.Router();
        this.router.get('/', this.fetchAll.bind(this));
        this.router.get('/:id', this.findOne.bind(this));
        this.router.post('/', this.createTask.bind(this));
        this.router.put('/:id', this.updateTask.bind(this));
        this.router.delete('/:id', this.deleteTask.bind(this));
    }
    fetchAll(req, res) {
        let $this = this;
        this.db.collection(TASKS).aggregate(this.includeUserAndCustomer())
            .toArray()
            .then((tasks) => {
            res.send(tasks);
        })
            .catch((err) => res.status(400).send(err));
    }
    findOne(req, res) {
        let $this = this;
        this.db.collection(TASKS).aggregate([].concat({
            $match: {
                id: req.params.id
            }
        }, this.includeUserAndCustomer())).next().then((task) => {
            res.status(200).send(task);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    createTask(req, res) {
        let task = req.body;
        task.id = (new Date()).valueOf().toString();
        this.db
            .collection(TASKS)
            .insertOne(task)
            .then((response) => {
            res.send(task.id);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    updateTask(req, res) {
        delete req.body._id;
        let task = req.body;
        this.db.collection(TASKS)
            .updateOne({ id: req.params.id }, { $set: task })
            .then((data) => {
            res.send(data);
        })
            .catch((err) => {
            res.status(400).send(err);
        });
    }
    deleteTask(req, res) {
        this.db.collection(TASKS).deleteOne({ id: req.params.id })
            .then(deleteResult => res.send())
            .catch(error => res.status(400).send(error));
    }
    includeUserAndCustomer() {
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
        ];
    }
}
TasksController.route = `/${TASKS}`;
exports.TasksController = TasksController;
