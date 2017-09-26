"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CUSTOMERS = "customers";
class CustomerController {
    constructor(db) {
        this.router = express_1.Router();
        this.db = db;
        this.router.get('/', this.customers.bind(this));
        this.router.get('/:id', this.customer.bind(this));
        this.router.post('/', this.createCustomer.bind(this));
        this.router.put('/:id', this.updateCustomer.bind(this));
        this.router.delete('/:id', this.deleteCustomer.bind(this));
    }
    customers(req, res) {
        this.db
            .collection(CUSTOMERS)
            .find().toArray()
            .then((customers) => {
            res.status(200).send(customers);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    customer(req, res) {
        this.fetchCustomer(req.params.id)
            .then((customer) => {
            res.status(200).send(customer);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    fetchCustomer(customerId) {
        return this.db
            .collection(CUSTOMERS)
            .findOne({ id: customerId });
    }
    createCustomer(req, res) {
        req.body.id = (new Date()).valueOf().toString();
        this.db
            .collection(CUSTOMERS)
            .insertOne(req.body)
            .then((cust) => {
            res.send(req.body.id);
        }).catch(err => {
            res.status(400).send(err);
        });
    }
    updateCustomer(req, res) {
        delete req.body._id;
        this.db.collection(CUSTOMERS)
            .updateOne({ id: req.params.id }, { $set: req.body })
            .then((data) => {
            res.send(data);
        })
            .catch((err) => {
            res.status(400).send(err);
        });
    }
    deleteCustomer(req, res) {
        this.db.collection(CUSTOMERS).deleteOne({ id: req.params.id })
            .then(deleteResult => res.send())
            .catch(error => res.status(400).send(error));
    }
}
CustomerController.route = `/${CUSTOMERS}`;
exports.CustomerController = CustomerController;
