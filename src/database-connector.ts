import * as mongoose from "mongoose";
import DatabaseConfiguration from "./database-configuration";
import * as _ from "lodash";

// @ts-ignore
mongoose.Promise = Promise;

let instance: DatabaseConnector;

export default class DatabaseConnector {

    config: any;
    _connection: any;

    constructor(config: any) {
        this.config = new DatabaseConfiguration(config);
        instance = this;
    }

    connect() {
        let that = this;
        return new Promise((resolve, reject) => {

            that._connection = mongoose.createConnection(this.config.getUri(), {useNewUrlParser: true});

            that._connection.on('connecting', () => {
                console.log('trying to establish a connection to mongo');
            });

            that._connection.on('connected', () => {
                console.log('connection established successfully');
            });

            that._connection.on('error', (err: Error) => {
                console.error('connection to mongo failed \n' + err);
                reject(err);
            });

            that._connection.on('open', () => {
                console.log('mongo db connection open');
                resolve(that._connection);
            });

        });
    }

    async checkDatabase() {
        let that = this;

        // @ts-ignore
        let response = await new mongoose.mongo.Admin(this._connection.db).listDatabases();
        let index = _.findIndex(response['databases'], function (db: any) {
            return db.name === that.config.name;
        });
        if (index !== -1) {
            console.log('database \'' + this.config.name + '\' exists');
        }
        else {
            console.log('database \'' + this.config.name + '\' don\'t exists');
            throw new Error('database \'' + this.config.name + '\' don\'t exists');
        }
    }

    dropDatabase() {
        return this._connection.db.dropDatabase();
    }

    closeConnection() {
        this._connection.close();
    }

    getConnection() {
        return this._connection;
    }

    static getInstance() {
        return instance;
    }

}