import {DatabaseConfiguration, DatabaseConnection} from "./core";
import {ObjectId} from "mongodb";
import Collection from "./collection/Collection";
import CollectionDefinitionRegistry from "./collection/CollectionDefinitionRegistry";

import OperationInterceptorService from "./operation-interceptor/OperationInterceptorService";
import OperationInterceptorInterface from "./operation-interceptor/OperationInterceptor.interface";

import Schema from "./Schema";

import FieldType from "./field-types/FieldType.interface";
import StringFieldType from "./field-types/types/StringFieldType";
import IntegerFieldType from "./field-types/types/IntegerFieldType";
import DateFieldType from "./field-types/types/DateFieldType";
import FieldTypeRegistry from "./field-types/FieldTypeRegistry";
import ObjectFieldType from "./field-types/types/ObjectFieldType";
import BooleanFieldType from "./field-types/types/BooleanFieldType";
import ObjectIdFieldType from "./field-types/types/ObjectIdFieldType";
import CollectionDefinition from "./collection/CollectionDefinition";

const privates = new WeakMap();

export default class ODM {

    constructor() {
        const fieldTypeRegistry = new FieldTypeRegistry();
        const collectionDefinitionRegistry = new CollectionDefinitionRegistry();
        const operationInterceptorService = new OperationInterceptorService();
        privates.set(this, {fieldTypeRegistry, collectionDefinitionRegistry, operationInterceptorService});
        _loadBuildInFieldTypes(this);
    }

    async connect(config: any) {
        if (!config)
            throw new Error("ODM::connect -> There is no config provided");
        const dbConfig = new DatabaseConfiguration(config.host, config.port, config.dialect, config.database, config.username, config.password);
        const conn = await DatabaseConnection.connect(dbConfig);
        await conn.deleteAllIndexes();
        _setConnection(this, conn);
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
        const schema = new Schema(schemaJson, _getFieldTypeRegistry(that), _getCollectionDefinitionRegistry(this));
        const col = new CollectionDefinition(_getConnection(that).getDBO().collection(schema.getBaseName()), schema, _getOperationInterceptorService(this));
        _getCollectionDefinitionRegistry(this).addCollectionDefinition(col);
    }

    collection(colName: string, context?: any): Collection  {
        const collectionDefinition: CollectionDefinition | undefined = _getCollectionDefinitionRegistry(this).getCollectionDefinition(colName);
        if (collectionDefinition === undefined)
            throw Error(`Collection with name '${colName}' does not exist`);
        return new Collection(collectionDefinition, context)
    }

    removeCollection(collectionName: string): void {
        _getCollectionDefinitionRegistry(this).deleteCollectionDefinition(collectionName);
    }

    isCollectionDefined(collectionName: string): boolean {
        return _getCollectionDefinitionRegistry(this).hasCollectionDefinition(collectionName);
    }

    addFieldType(fieldType: FieldType): void {
        _getFieldTypeRegistry(this).addFieldType(fieldType);
    }

    addInterceptor(operationInterceptor: OperationInterceptorInterface): void {
        _getOperationInterceptorService(this).addInterceptor(operationInterceptor);
    }

    deleteInterceptor(operationInterceptorName: string): void {
        _getOperationInterceptorService(this).deleteInterceptor(operationInterceptorName);
    }

    generateNewObjectId(): ObjectId {
        return new ObjectId();
    }

    convertToObjectId(id: string): ObjectId {
        return new ObjectId(id);
    }

}

/**
 * PRIVATE METHODS
 */
function _setConnection(that: ODM, conn: DatabaseConnection) {
    privates.get(that).conn = conn;
}

function _getConnection(that: ODM): DatabaseConnection {
    let conn = privates.get(that).conn;
    if (!conn)
        throw new Error("ODM::getConn -> There is no active connection");
    return conn;
}

function _getCollectionDefinitionRegistry(that: ODM): CollectionDefinitionRegistry {
    return privates.get(that).collectionDefinitionRegistry;
}

function _getFieldTypeRegistry(that: ODM): FieldTypeRegistry {
    return privates.get(that).fieldTypeRegistry;
}

function _getOperationInterceptorService(that: ODM): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

function _loadBuildInFieldTypes(that: ODM) {
    that.addFieldType(new StringFieldType());
    that.addFieldType(new IntegerFieldType());
    that.addFieldType(new DateFieldType());
    that.addFieldType(new ObjectFieldType());
    that.addFieldType(new BooleanFieldType());
    that.addFieldType(new ObjectIdFieldType());
}

