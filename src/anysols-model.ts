import DatabaseConfiguration from "./model/database-configuration";
import DatabaseConnection from "./model/database-connection";
import DatabaseService from "./service/database-service";

const dbService = new DatabaseService();

export class AnysolsModel {

    private readonly dbConfig: DatabaseConfiguration;
    private conn: DatabaseConnection | undefined;

    constructor(config: any) {
        this.dbConfig = new DatabaseConfiguration(config.host, config.port, config.name, config.user, config.password, config.dialect);
    }

    async connect() {
        this.conn = await dbService.connect(this.dbConfig);
        return this.conn;
    }

    closeConnection() {
        if (!this.conn)
            throw new Error("AnysolsModel::closeConnection -> There is no active connection");
        this.conn.closeConnection();
    }

    databaseExists() {
        if (!this.conn)
            throw new Error("AnysolsModel::databaseExists -> There is no active connection");
        return this.conn.databaseExists(this.dbConfig.getDatabaseName());
    }
}
