import DatabaseConfiguration from "./database-configuration";

export default class AnysolsModel {

    private dbConfig: DatabaseConfiguration;
    
    constructor(config) {
        this.dbConfig = new DatabaseConfiguration(config.host, config.port, config.name, config.user, config.password, config.dialect);
    }

    async connect() {
    }

    async databaseExists() {
    }

}
