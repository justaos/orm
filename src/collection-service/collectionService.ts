import {DatabaseConnection} from "../connection";
import FieldTypeRegistry from "./field-types/fieldTypeRegistry";
import CollectionRegistry from "./collection/collectionRegistry";
import Collection from "./collection/collection";
import FieldType from "./field-types/fieldType";
import StringFieldType from "./field-types/stringFieldType";
import IntegerFieldType from "./field-types/integerFieldType";
import DateFieldType from "./field-types/dateFieldType";
import OperationInterceptorService from "./operation-interceptor/operationInterceptorService";
import OperationInterceptor from "./operation-interceptor/operationInterceptor";
import Schema from "./schema/schema";

const privates = new WeakMap();

export default class CollectionService {

    constructor() {
        const fieldTypeRegistry = new FieldTypeRegistry();
        const collectionRegistry = new CollectionRegistry();
        const operationInterceptorService = new OperationInterceptorService();
        privates.set(this, {fieldTypeRegistry, collectionRegistry, operationInterceptorService});
        _loadBuildInFieldTypes(this);
    }

    setConnection(conn: DatabaseConnection) {
        privates.get(this).conn = conn;
    }

    isCollectionDefined(collectionName: string) {
        return _getCollectionRegistry(this).hasCollection(collectionName);
    }

    defineCollection(schemaJson: any) {
        const that = this;
        const schema = new Schema(schemaJson, _getFieldTypeRegistry(that));
        const collection = new Collection(schema,
            _getConnection(that).getDBO().collection(schema.getName()),
            _getOperationInterceptorService(that));
        _getCollectionRegistry(this).addCollection(collection);
    }

    removeCollection(collectionName: string): void {
        _getCollectionRegistry(this).deleteCollection(collectionName);
    }

    collection(collectionName: any): Collection {
        const collection = _getCollectionRegistry(this).getCollection(collectionName);
        if (!collection)
            throw Error("[CollectionService::collection] collection with name '" + collectionName + "' does not exist");
        return collection;
    }

    addFieldType(fieldType: FieldType) {
        _getFieldTypeRegistry(this).addFieldType(fieldType);
    }

    addInterceptor(operationInterceptor: OperationInterceptor) {
        _getOperationInterceptorService(this).addInterceptor(operationInterceptor);
    }
}

/**
 * PRIVATE METHODS
 */
function _getConnection(that: CollectionService) {
    let conn = privates.get(that).conn;
    if (!conn)
        throw new Error("CollectionService::_getConnection -> There is no connection");
    return conn;
}

function _loadBuildInFieldTypes(that: CollectionService) {
    that.addFieldType(new StringFieldType());
    that.addFieldType(new IntegerFieldType());
    that.addFieldType(new DateFieldType());
}

function _getCollectionRegistry(that: CollectionService): CollectionRegistry {
    return privates.get(that).collectionRegistry;
}

function _getFieldTypeRegistry(that: CollectionService): FieldTypeRegistry {
    return privates.get(that).fieldTypeRegistry;
}

function _getOperationInterceptorService(that: CollectionService): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

