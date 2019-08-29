import {Db, MongoClient} from "mongodb";
import DatabaseConfiguration from "./databaseConfiguration";

function createConnectionByUri(uri: string): Promise<MongoClient> {
    return new Promise((resolve, reject) => {
        MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, conn) => {
            if (err) reject(err);
            resolve(conn);
        });
    });
}

const privates = new WeakMap();

export default class DatabaseConnection {

    private readonly conn: MongoClient;
    private readonly collections: Map<string, any>;

    constructor(conn: MongoClient, config: DatabaseConfiguration) {
        this.conn = conn;
        this.collections = new Map<string, any>();
        privates.set(this, {config});
    }

    static connect(dbConfig: DatabaseConfiguration): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try {
                let conn = await createConnectionByUri(dbConfig.getUri());
                console.log('mongo db connection open');
                resolve(new DatabaseConnection(conn, dbConfig));
            } catch (err) {
                console.error('connection to mongo failed \n' + err);
                reject(err);
            }
        });
    }

    static dropDatabase(dbConfig: DatabaseConfiguration): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const c = await DatabaseConnection.connect(dbConfig);
            c.dropDatabase().then(() => {
                c.closeConnection();
                resolve();
            }, () => {
                c.closeConnection();
                reject();
            });
        });
    }

    dropDatabase(): Promise<any> {
        const that = this;
        return new Promise(async (resolve, reject) => {
            that.getDBO().dropDatabase().then(() => {
                resolve();
            }, () => {
                reject();
            });
        });
    }

    getDBO(): Db {
        return this.conn.db(this.getDatabaseName());
    }

    getDatabaseName(): string {
        return privates.get(this).config.getDatabaseName();
    }

    databaseExists(): Promise<any> {
        const that = this;
        return new Promise(async (resolve, reject) => {
            // Use the admin database for the operation
            const adminDb = that.conn.db('test').admin();

            // List all the available databases
            let dbs = await adminDb.listDatabases();

            let index = dbs.databases.findIndex((db: any) => db.name === that.getDatabaseName());
            if (index !== -1) {
                console.log("database \"" + that.getDatabaseName() + "\" exists");
                resolve();
            } else {
                console.log("database \"" + that.getDatabaseName() + "\" don't exists");
                reject(new Error("database \"" + that.getDatabaseName() + "\" don't exists"));
            }
        });

    }

    closeConnection() {
        return this.conn.close();
    }


}
