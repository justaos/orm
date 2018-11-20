import DatabaseConnector from "./database-connector";
import DatabaseConfiguration from "./database-configuration";


export class DatabaseService {

    static connect(config: any): Promise<any> {
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.name, config.user, config.password, config.dialect);
        let dbConnector = new DatabaseConnector(dbConfig);
        return dbConnector.connect(); // returns promise
    }

    static databaseExists() {
        return DatabaseConnector.getInstance().databaseExists();
    }

    static dropDatabase() {
        return DatabaseConnector.getInstance().dropDatabase();
    }

}
