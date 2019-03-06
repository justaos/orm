import DatabaseConfiguration from "./database-configuration";
import DatabaseConnector from "./database-connector";

export default class AnysolsModel {

    private dbConfig: DatabaseConfiguration;
    private conn: DatabaseConnection;
    
    constructor(config) {
        this.dbConfig = new DatabaseConfiguration(config.host, config.port, config.name, config.user, config.password, config.dialect);
    }

    async connect() {
        this.conn = await new DatabaseConnection(this.dbConfig).connect();
        return this.conn;
    }

    async databaseExists() {
    }

}
