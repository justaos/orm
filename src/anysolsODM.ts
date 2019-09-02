import {DatabaseConfiguration, DatabaseConnection} from "./core";

import AnysolsCollection from "./collection/anysolsCollection";
import AnysolsCollectionRegistry from "./collection/anysolsCollectionRegistry";

import OperationInterceptorService from "./operation-interceptor/operationInterceptorService";
import OperationInterceptor from "./operation-interceptor/operationInterceptor";

import AnysolsSchema from "./schema/anysolsSchema";

import FieldType from "./field-types/fieldType.interface";
import StringFieldType from "./field-types/stringFieldType";
import IntegerFieldType from "./field-types/integerFieldType";
import DateFieldType from "./field-types/dateFieldType";
import FieldTypeRegistry from "./field-types/fieldTypeRegistry";
import {Collection} from "mongodb";
import ObjectFieldType from "./field-types/objectFieldType";

const privates = new WeakMap();

export default class AnysolsODM {

    constructor() {
        const fieldTypeRegistry = new FieldTypeRegistry();
        const collectionRegistry = new AnysolsCollectionRegistry();
        const operationInterceptorService = new OperationInterceptorService();
        privates.set(this, {fieldTypeRegistry, collectionRegistry, operationInterceptorService});
        _loadBuildInFieldTypes(this);
    }

    async connect(config: any) {
        if (!config)
            throw new Error("AnysolsODM::connect -> There is no config provided");
        const dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);
        _setConnection(this, await DatabaseConnection.connect(dbConfig));
    }

    closeConnection(): Promise<void> {
        const conn = _getConnection(this);
        return conn.closeConnection();
    }

    databaseExists(): Promise<any> {
        let conn = _getConnection(this);
        return conn.databaseExists();
    }

    dropDatabase() {
        let conn = _getConnection(this);
        return conn.dropDatabase();
    }

    defineCollection(schemaJson: any) {
        const that = this;
        const schema = new AnysolsSchema(schemaJson, _getFieldTypeRegistry(that), _getAnysolsCollectionRegistry(this));
        const anysolsCol = new AnysolsCollection(_getCollection(that, schema.getHostName()), schema, _getOperationInterceptorService(that));
        _getAnysolsCollectionRegistry(this).addCollection(anysolsCol);
    }

    collection(colName: string): AnysolsCollection {
        const anysolsCol = _getAnysolsCollectionRegistry(this).getCollection(colName);
        if (!anysolsCol)
            throw Error("[CollectionService::collection] collection with name '" + colName + "' does not exist");
        return anysolsCol;
    }

    removeCollection(collectionName: string): void {
        _getAnysolsCollectionRegistry(this).deleteCollection(collectionName);
    }

    isCollectionDefined(collectionName: string): boolean {
        return _getAnysolsCollectionRegistry(this).hasCollection(collectionName);
    }

    addFieldType(fieldType: FieldType): void {
        _getFieldTypeRegistry(this).addFieldType(fieldType);
    }

    addInterceptor(operationInterceptor: OperationInterceptor): void {
        _getOperationInterceptorService(this).addInterceptor(operationInterceptor);
    }

    deleteInterceptor(operationInterceptorName: string): void {
        _getOperationInterceptorService(this).deleteInterceptor(operationInterceptorName);
    }

}

/**
 * PRIVATE METHODS
 */
function _setConnection(that: AnysolsODM, conn: DatabaseConnection) {
    privates.get(that).conn = conn;
}

function _getCollection(that: AnysolsODM, collectionName: string): Collection {
    return _getConnection(that).getDBO().collection(collectionName);
}

function _getConnection(that: AnysolsODM): DatabaseConnection {
    let conn = privates.get(that).conn;
    if (!conn)
        throw new Error("AnysolsODM::getConn -> There is no active connection");
    return conn;
}

function _getAnysolsCollectionRegistry(that: AnysolsODM): AnysolsCollectionRegistry {
    return privates.get(that).collectionRegistry;
}

function _getFieldTypeRegistry(that: AnysolsODM): FieldTypeRegistry {
    return privates.get(that).fieldTypeRegistry;
}

function _getOperationInterceptorService(that: AnysolsODM): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

function _loadBuildInFieldTypes(that: AnysolsODM) {
    that.addFieldType(new StringFieldType());
    that.addFieldType(new IntegerFieldType());
    that.addFieldType(new DateFieldType());
    that.addFieldType(new ObjectFieldType());
}

