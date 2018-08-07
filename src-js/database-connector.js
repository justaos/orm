const mongoose = require('mongoose');
const _ = require('lodash');
const Admin = mongoose.mongo.Admin;
mongoose.Promise = Promise;

let instance;

class DatabaseConnector {

    constructor(dbConfig) {
        instance = this;
        this.config = dbConfig;
    }

    connect() {
        let that = this;
        return new Promise((resolve, reject) => {
            that._connection =
                mongoose.createConnection(`${this.config.dialect}://${this.config.host}:${this.config.port}/${this.config.name}`, {useNewUrlParser: true});

            that._connection.on('connecting', () => {
                console.log('trying to establish a connection to mongo');
            });

            that._connection.on('connected', () => {
                console.log('connection established successfully');
            });

            that._connection.on('error', (err) => {
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
        let response = await new Admin(this._connection.db).listDatabases();
        let index = _.findIndex(response['databases'], function (db) {
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

module.exports = DatabaseConnector;