import {DatabaseConfiguration, DatabaseConnection} from "./connection";
import {FieldType, ModelService} from "./model";

const privates = new WeakMap();

export default class AnysolsModel {

    constructor() {
        const modelService = new ModelService();
        privates.set(this, {modelService});
    }

    async connect(config: any) {
        if (!config)
            throw new Error("AnysolsModel::connect -> There is no config provided");
        let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        _setConnection(this, await DatabaseConnection.connect(dbConfig));
    }

    closeConnection() {
        let conn = _getConnection(this);
        return conn.closeConnection();
    }

    databaseExists() {
        let conn = _getConnection(this);
        return conn.databaseExists();
    }

    dropDatabase() {
        let conn = _getConnection(this);
        return conn.dropDatabase();
    }

    defineModel(schemaDefinition: any) {
        let modelService = _getModelService(this);
        modelService.defineModel(schemaDefinition);
    }

    model(modelName: string) {
        let modelService = _getModelService(this);
        return modelService.model(modelName);
    }

    addFieldType(fieldType: FieldType) {
        let modelService = _getModelService(this);
        return modelService.addFieldType(fieldType);
    }

}

/**
 * PRIVATE METHODS
 */
function _setConnection(that: any, conn: DatabaseConnection) {
    privates.get(that).conn = conn;
    privates.get(that).modelService.setConnection(conn);
}

function _getConnection(that: any): DatabaseConnection {
    let conn = privates.get(that).conn;
    if (!conn)
        throw new Error("AnysolsModel::getConn -> There is no active connection");
    return conn;
}

function _getModelService(that: any): ModelService {
    privates.get(that).modelService.setConnection(_getConnection(that));
    return privates.get(that).modelService;
}
