"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = require("body-parser");
const mongodb_1 = require("mongodb");
const cors = require("cors");
const users_1 = require("./controllers/users");
const images_1 = require("./controllers/images");
class Index {
    constructor() {
        this.app = express();
        this.configureMiddleware(this.app);
    }
    run(db) {
        let $this = this;
        $this.configureRoutes($this.app, db);
        $this.app.listen($this.app.get('port'), function () {
            console.log('Node app is running on port', $this.app.get('port'));
        });
    }
    configureMiddleware(app) {
        app.set('port', (process.env.PORT || 5000));
        app.use(body_parser_1.json());
        app.use(body_parser_1.urlencoded({ extended: true }));
        let options = {
            allowedHeaders: '*',
            methods: '*',
            origin: '*'
        };
        app.use(cors());
        //enable pre-flight
        app.options("*", cors(options));
    }
    configureRoutes(app, db) {
        app.use(users_1.UsersController.route, new users_1.UsersController(db).router);
        app.use(images_1.ImagesController.route, new images_1.ImagesController(db).router);
    }
}
exports.Index = Index;
mongodb_1.MongoClient.connect('mongodb://heroku_8mbg895x:r8i35ok4o1sjm6iro9j7souf0e@ds161713.mlab.com:61713/heroku_8mbg895x', (err, db) => {
    new Index().run(db);
});
