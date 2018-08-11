import DatabaseConnector from "./database-connector";
import DatabaseConfiguration from "./database-configuration";


export default class DatabaseService {

    static connect(config: any): Promise<any> {
        let dbConfig = new DatabaseConfiguration(config);
        let dbConnector = new DatabaseConnector(dbConfig);
        return dbConnector.connect(); // returns promise
    }

    static databaseExists() {
        return DatabaseConnector.getInstance().databaseExists();
    }

    static dropDatabase(){
        return DatabaseConnector.getInstance().dropDatabase();
    }

}