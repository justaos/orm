import DatabaseConfiguration from "./database-configuration";
import DatabaseConnection from "./database-connection";
import DatabaseService from "./database-service";

const dbService = new DatabaseService();

export default class AnysolsModel {

    private dbConfig: DatabaseConfiguration;
    private conn: DatabaseConnection;
    
    constructor(config) {
        this.dbConfig = new DatabaseConfiguration(config.host, config.port, config.name, config.user, config.password, config.dialect);
    }

    async connect() {
        this.conn = await dbService.connect(this.dbConfig);
        return this.conn;
    }

    databaseExists() {
        return dbService.databaseExists(this.conn, this.dbConfig.name);
    }

}
