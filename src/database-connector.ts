import * as mongoose from "mongoose";
import DatabaseConfiguration from "./database-configuration";

// @ts-ignore
mongoose.Promise = Promise;

let instance: DatabaseConnector;

export default class DatabaseConnector {

    config: any;
    private conn: any;

    constructor(config: DatabaseConfiguration) {
        this.config = config;
        instance = this;
    }

    connect() {
        let that = this;
        return new Promise((resolve, reject) => {

            that.conn = mongoose.createConnection(this.config.getUri(), {
                useNewUrlParser: true
            });

            that.conn.on('connecting', () => {
                console.log('trying to establish a connection to mongo');
            });

            that.conn.on('connected', () => {
                console.log('connection established successfully');
            });

            that.conn.on('error', (err: Error) => {
                console.error('connection to mongo failed \n' + err);
                reject(err);
            });

            that.conn.on('open', () => {
                console.log('mongo db connection open');
                resolve();
            });

        });
    }

    async databaseExists() {
        let that = this;

        // @ts-ignore
        let response = await new mongoose.mongo.Admin(this.conn.db).listDatabases();
        let index = response['databases'].findIndex(function(db: any) {
            return db.name === that.config.name;
        });
        if (index !== -1) {
            console.log('database \'' + this.config.name + '\' exists');
        } else {
            console.log('database \'' + this.config.name + '\' don\'t exists');
            throw new Error('database \'' + this.config.name + '\' don\'t exists');
        }
    }

    dropDatabase() {
        return this.conn.db.dropDatabase();
    }

    closeConnection() {
        this.conn.close();
    }

    getConnection() {
        return this.conn;
    }

    static getInstance() {
        return instance;
    }

}
