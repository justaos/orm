import DatabaseConnection from "./model/database-connection";
import DatabaseConfiguration from "./model/database-configuration";

export default class DatabaseService {

    protected conn: DatabaseConnection | undefined;

    closeConnection() {
        if (!this.conn)
            throw new Error("AnysolsModel::closeConnection -> There is no active connection");
        this.conn.closeConnection();
    }

    async connect(config: any) {
        if (!config)
            throw new Error("AnysolsModel::connect -> There is no config provided");
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        this.conn = await DatabaseConnection.connect(dbConfig);
        return this.conn;
    }

    databaseExists() {
        if (!this.conn)
            throw new Error("AnysolsModel::databaseExists -> There is no active connection");
        return this.conn.databaseExists(this.conn.getDatabaseName());
    }

    dropDatabase() {
        if (!this.conn)
            throw new Error("AnysolsModel::dropDatabase -> There is no active connection");
        let config = this.conn.getConfig();
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.user, config.password, 'mysql');
        return DatabaseConnection.dropDatabase(dbConfig);
    }
}
