import { Router, Express } from 'express';
import * as express from 'express';
import * as http from 'http';
import { json, urlencoded } from 'body-parser';
import * as mongodb from 'mongodb';
import { MongoClient, Db } from 'mongodb';
import * as cors from "cors";

import { UsersController } from './controllers/users';
import { ImagesController } from './controllers/images'
import { LanguagesController } from './controllers/languages';
import { LocalitiesController } from './controllers/localities';
import { TripsController } from './controllers/trips';
import { VariationsController } from "./controllers/variations";

export class Index {
    public app: Express;
    constructor() {
        this.app = express();
        this.configureMiddleware(this.app);
    }

    run(db: Db) {
        let $this = this;
        $this.configureRoutes($this.app, db);
        $this.app.listen($this.app.get('port'), function () {
            console.log('Node app is running on port', $this.app.get('port'));
        });

    }

    private configureMiddleware(app: express.Express) {

        app.set('port', (process.env.PORT || 5000));
        app.use(json());
        app.use(urlencoded({ extended: true }));
        let options: cors.CorsOptions = {
            allowedHeaders: '*',
            methods: '*',
            origin: '*'
        }
        app.use(cors())
        //enable pre-flight
        app.options("*", cors(options));
    }

    private configureRoutes(app: express.Router, db: Db) {
        app.use(UsersController.route, new UsersController(db).router);
        app.use(ImagesController.route, new ImagesController(db).router);
        app.use(LanguagesController.route, new LanguagesController(db).router);
        app.use(LocalitiesController.route, new LocalitiesController(db).router);
        app.use(TripsController.route, new TripsController(db).router);
        app.use(VariationsController.route, new VariationsController(db).router);
    }

}

MongoClient.connect('mongodb://heroku_8mbg895x:r8i35ok4o1sjm6iro9j7souf0e@ds161713.mlab.com:61713/heroku_8mbg895x',
    (err, db) => {
        new Index().run(db);
    });
