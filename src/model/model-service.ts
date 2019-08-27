import {DatabaseConnection} from "../connection";
import FieldTypeRegistry from "./field-types/field-type-registry";
import ModelRegistry from "./model-registry";
import Model from "./model";
import FieldType from "./field-types/field-type";
import StringFieldType from "./field-types/string-field-type";
import IntegerFieldType from "./field-types/integer-field-type";
import DateFieldType from "./field-types/date-field-type";
import OperationInterceptorService from "./operation-interceptor/operation-interceptor-service";
import OperationInterceptor from "./operation-interceptor/operation-interceptor";

const privates = new WeakMap();

export default class ModelService {

    constructor() {
        const fieldTypeRegistry = new FieldTypeRegistry();
        const modelRegistry = new ModelRegistry();
        const operationInterceptorService = new OperationInterceptorService();
        privates.set(this, {fieldTypeRegistry, modelRegistry, operationInterceptorService});
        _loadBuildInFieldTypes(this);
    }

    setConnection(conn: DatabaseConnection) {
        privates.get(this).conn = conn;
    }

    isModelDefined(modelName: string) {
        return _getModelRegistry(this).hasModel(modelName);
    }

    defineModel(schema: any) {
        let that = this;
        let model = new Model(schema,
            (model: Model) => _getConnection(that).getDBO().collection(model.getName()),
            _getFieldTypeRegistry(that),
            _getOperationInterceptorService(that));
        _getModelRegistry(this).addModel(model);
    }

    removeModel(modelName: string) {
        _getModelRegistry(this).deleteModel(modelName);
    }

    model(modelName: any) {
        return _getModelRegistry(this).getModel(modelName);
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
function _getConnection(that: ModelService) {
    let conn = privates.get(that).conn;
    if (!conn)
        throw new Error("ModelService::_getConnection -> There is no connection");
    return conn;
}

function _loadBuildInFieldTypes(that: ModelService) {
    that.addFieldType(new StringFieldType());
    that.addFieldType(new IntegerFieldType());
    that.addFieldType(new DateFieldType());
}

function _getModelRegistry(that: ModelService): ModelRegistry {
    return privates.get(that).modelRegistry;
}

function _getFieldTypeRegistry(that: ModelService): FieldTypeRegistry {
    return privates.get(that).fieldTypeRegistry;
}

function _getOperationInterceptorService(that: ModelService): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

