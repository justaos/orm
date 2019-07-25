import DatabaseConnection from "./model/database-connection";
import DatabaseConfiguration from "./model/database-configuration";

export default class DatabaseService {

    private conn: DatabaseConnection | undefined;

    private config: any;

    protected getConn(): DatabaseConnection {
        if (!this.conn)
            throw new Error("AnysolsModel::closeConnection -> There is no active connection");
        return this.conn;
    }

    closeConnection() {
        this.getConn().closeConnection();
    }

    async connect(config: any) {
        if (!config)
            throw new Error("AnysolsModel::connect -> There is no config provided");
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        this.conn = await DatabaseConnection.connect(dbConfig);
        this.config = config;
        return this.conn;
    }

    databaseExists() {
        return this.getConn().databaseExists(this.getConn().getDatabaseName());
    }

    dropDatabase() {
        let config = this.config;
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password);
        return DatabaseConnection.dropDatabase(dbConfig);
    }
}
