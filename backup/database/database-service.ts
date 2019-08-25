import DatabaseConnection from "./model/database-connection";
import DatabaseConfiguration from "./model/database-configuration";
import ModelService from "../model-handler/model-service";
import FieldDefinitionRegistry from "./field-definition-registry";
import {FieldType} from "../../src";

export default class DatabaseService {

    private conn: DatabaseConnection | undefined;

    private modelService: ModelService | undefined;

    private readonly fieldDefinitionRegistry: FieldDefinitionRegistry;

    private config: any;

    constructor() {
        this.fieldDefinitionRegistry = new FieldDefinitionRegistry();
    }

    closeConnection() {
        return this.getConn().closeConnection();
    }

    async connect(config: any) {
        if (!config)
            throw new Error("AnysolsModel::connect -> There is no config provided");
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        this.conn = await DatabaseConnection.connect(dbConfig);
        this.config = config;
        this.modelService = new ModelService(this.getConn(), this.fieldDefinitionRegistry);
    }

    registerFieldDefinition(fieldDefinition: FieldType) {
        this.fieldDefinitionRegistry.registerFieldDefinition(fieldDefinition);
    }

    databaseExists() {
        return this.getConn().databaseExists(this.getConn().getDatabaseName());
    }

    dropDatabase() {
        let config = this.config;
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password);
        return DatabaseConnection.dropDatabase(dbConfig);
    }

    protected getConn(): DatabaseConnection {
        if (!this.conn)
            throw new Error("AnysolsModel::getConn -> There is no active connection");
        return this.conn;
    }

    protected getModelService(): ModelService {
        if (!this.modelService)
            throw new Error("AnysolsModel::modelService -> There is no modelService");
        return this.modelService;
    }
}
