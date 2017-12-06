"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = require("body-parser");
const mongodb_1 = require("mongodb");
const cors = require("cors");
const UserController_1 = require("./controllers/UserController");
const images_1 = require("./controllers/images");
const languages_1 = require("./controllers/languages");
const localities_1 = require("./controllers/localities");
const trips_1 = require("./controllers/trips");
const variations_1 = require("./controllers/variations");
const PaymentController_1 = require("./controllers/PaymentController");
const Itineraries_1 = require("./controllers/Itineraries");
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
        app.use('/uploads', express.static('uploads'));
        //enable pre-flight
        app.options("*", cors(options));
    }
    configureRoutes(app, db) {
        app.use(UserController_1.UserController.route, new UserController_1.UserController(db).router);
        app.use(images_1.ImagesController.route, new images_1.ImagesController(db).router);
        app.use(languages_1.LanguagesController.route, new languages_1.LanguagesController(db).router);
        app.use(localities_1.LocalitiesController.route, new localities_1.LocalitiesController(db).router);
        app.use(trips_1.TripsController.route, new trips_1.TripsController(db).router);
        app.use(variations_1.VariationsController.route, new variations_1.VariationsController(db).router);
        app.use(PaymentController_1.PaymentController.route, new PaymentController_1.PaymentController(db).router);
        app.use(Itineraries_1.ItinerariesController.route, new Itineraries_1.ItinerariesController(db).router);
    }
}
exports.Index = Index;
mongodb_1.MongoClient.connect('mongodb://heroku_8mbg895x:r8i35ok4o1sjm6iro9j7souf0e@ds161713.mlab.com:61713/heroku_8mbg895x', (err, db) => {
    new Index().run(db);
});
