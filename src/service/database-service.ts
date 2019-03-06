import DatabaseConfiguration from "../model/database-configuration";
import * as mongoose from "mongoose";
import DatabaseConnection from "../model/database-connection";

export default class DatabaseService {

    connect(dbConfig: DatabaseConfiguration): Promise<any> {
        let that = this;
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



}
