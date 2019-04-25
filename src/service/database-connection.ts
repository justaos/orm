import * as mongoose from "mongoose";
import {Connection} from "mongoose";
import DatabaseConfiguration from "../model/database-configuration";

export default class DatabaseConnection {

    private readonly conn: Connection;

    constructor(conn: Connection) {
        this.conn = conn;
    }

    static connect(dbConfig: DatabaseConfiguration): Promise<any> {
        return new Promise((resolve, reject) => {

            let conn = mongoose.createConnection(dbConfig.getUri(), {
                useNewUrlParser: true
            });

            conn.on('connecting', () => {
                console.log('trying to establish a connection to mongo');
            });

            conn.on('connected', () => {
                console.log('connection established successfully');
            });

            conn.on('error', (err: Error) => {
                console.error('connection to mongo failed \n' + err);
                reject(err);
            });

            conn.on('open', () => {
                console.log('mongo db connection open');
                resolve(new DatabaseConnection(conn));
            });
        });
    }

    async databaseExists(databaseName: string) {
        // @ts-ignore
        let response = await new mongoose.mongo.Admin(this.conn.db).listDatabases();
        let index = response['databases'].findIndex(function (db: any) {
            return db.name === databaseName;
        });
        if (index !== -1) {
            console.log("database \"" + databaseName + "\" exists");
        } else {
            console.log("database \"" + databaseName + "\" don't exists");
            throw new Error("database \"" + databaseName + "\" don't exists");
        }
    }

    closeConnection() {
        this.conn.close();
    }

    dropDatabase() {
        return this.conn.db.dropDatabase();
    }

    isModelDefined(modelName: string) {
        return this.conn.models[modelName];
    }

    defineModel(modelName: string, schema: mongoose.Schema) {
        this.conn.model(modelName, schema, modelName);
        return this.conn.models[modelName];
    }

    model(modelName: string) {
        return this.conn.model(modelName);
    }


}
