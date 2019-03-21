import * as mongoose from "mongoose";
import {Connection} from "mongoose";

export default class DatabaseConnection {

    private readonly conn: Connection;

    constructor(conn: Connection) {
        this.conn = conn;
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
