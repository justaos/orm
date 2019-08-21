import {MongoClient} from "mongodb";
import DatabaseConfiguration from "./database-configuration";

function createConnectionByUri(uri: string): Promise<MongoClient> {
    return new Promise((resolve, reject) => {
        MongoClient.connect(uri, (err, conn) => {
            if (err) reject(err);
            resolve(conn);
        });
    });
}

export default class DatabaseConnection {

    private readonly conn: MongoClient;
    private readonly models: Map<string, any>;

    constructor(conn: MongoClient) {
        this.conn = conn;
        this.models = new Map<string, any>();
    }

    static connect(dbConfig: DatabaseConfiguration): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try {
                let conn = await createConnectionByUri(dbConfig.getUri());
                console.log('mongo db connection open');
                resolve(new DatabaseConnection(conn));
            } catch (err) {
                console.error('connection to mongo failed \n' + err);
                reject(err);
            }
        });
    }

     static dropDatabase(dbConfig: DatabaseConfiguration): Promise<any> {
         return new Promise((resolve, reject) => {
            /* let conn = createConnectionByUri(dbConfig.getUri());
             conn.dropDatabase().then(() => {
                 conn.close();
                 resolve();
             }, () => {
                 conn.close();
                 reject();
             });*/
         });
     }

    getDatabaseName(): string {
        // @ts-ignore
        return this.conn['name'];
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
        return this.conn.close();
    }


    isModelDefined(modelName: string) {
        return true;// !!this.models.get(modelName);
    }

    defineModel(modelName: string, schema: any) {
        this.models.set(modelName, schema);
        return null; //this.conn.models[modelName];
    }

    removeModel(modelName: string) {
        this.models.delete(modelName);
    }

    model(modelName: string) {
        return null;// this.conn.model(modelName);
    }


}
