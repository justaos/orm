import {DatabaseConnection} from "../connection";
import FieldTypeRegistry from "./field-types/field-type-registry";
import CollectionRegistry from "./collectionRegistry";
import Collection from "./collection";
import FieldType from "./field-types/field-type";
import StringFieldType from "./field-types/string-field-type";
import IntegerFieldType from "./field-types/integer-field-type";
import DateFieldType from "./field-types/date-field-type";
import OperationInterceptorService from "./operation-interceptor/operation-interceptor-service";
import OperationInterceptor from "./operation-interceptor/operation-interceptor";

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

    defineCollection(schema: any) {
        let that = this;
        let collection = new Collection(schema,
            (collection: Collection) => _getConnection(that).getDBO().collection(collection.getName()),
            _getFieldTypeRegistry(that),
            _getOperationInterceptorService(that));
        _getCollectionRegistry(this).addCollection(collection);
    }

    removeCollection(collectionName: string) {
        _getCollectionRegistry(this).deleteCollection(collectionName);
    }

    collection(collectionName: any) {
        return _getCollectionRegistry(this).getCollection(collectionName);
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

