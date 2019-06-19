import {Sequelize} from 'sequelize';
import DatabaseConfiguration from "../model/database-configuration";

export default class DatabaseConnection {

    private readonly conn: Sequelize;

    constructor(conn: Sequelize) {
        this.conn = conn;
    }

    static connect(dbConfig: DatabaseConfiguration): Promise<any> {
        return new Promise((resolve, reject) => {

            let conn = new Sequelize(dbConfig.getUri());

            conn
                .authenticate()
                .then(() => {
                    console.log('Connection has been established successfully.');
                    resolve(new DatabaseConnection(conn));
                })
                .catch((err: any) => {
                    console.error('Unable to connect to the database:', err);
                    reject(err);
                });
        });
    }

    static createDatabase(dbConfig: DatabaseConfiguration): Promise<any> {
        return new Promise((resolve, reject) => {

            let conn = new Sequelize(dbConfig.getUriWithoutDatabase());

            conn
                .authenticate()
                .then(() => {
                    console.log('Connection has been established successfully.');
                    conn.query("CREATE DATABASE " + dbConfig.getDatabaseName() + ";").then(function () {
                        conn.close();
                        resolve(DatabaseConnection.connect(dbConfig));
                    });

                })
                .catch((err: any) => {
                    console.error('Unable to connect to the database:', err);
                    reject(err);
                });
        });
    }

    static dropDatabase(dbConfig: DatabaseConfiguration): Promise<any> {
        return new Promise((resolve, reject) => {

            let conn = new Sequelize(dbConfig.getUriWithoutDatabase());

            conn
                .authenticate()
                .then(() => {
                    console.log('Connection has been established successfully.');
                    conn.query("DROP DATABASE " + dbConfig.getDatabaseName() + ";").then(function () {
                        conn.close();
                        resolve();
                    });
                })
                .catch((err: any) => {
                    console.error('Unable to connect to the database:', err);
                    reject(err);
                });
        });
    }

    closeConnection() {
        this.conn.close();
    }

    isModelDefined(modelName: string) {
        return this.conn.models[modelName];
    }

    defineModel(modelName: string, schema: any) {
        //  this.conn.model(modelName, schema, modelName);


        return this.conn.define('Foo', {
            // @ts-ignore
            firstname: Sequelize.STRING,
            // @ts-ignore
            lastname: Sequelize.STRING
        }, {});
        //      return this.conn.models[modelName];
    }

    model(modelName: string) {
        return this.conn.model(modelName);
    }


}
