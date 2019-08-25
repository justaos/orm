import {DatabaseConnection} from "../connection";
import FieldTypeRegistry from "./field-types/field-type-registry";
import ModelRegistry from "./model-registry";
import Model from "./model";
import FieldType from "./field-types/field-type";
import StringFieldType from "./field-types/string-field-type";

const privates = new WeakMap();

export default class ModelService {

    private conn: DatabaseConnection | undefined;

    constructor() {
        const fieldTypeRegistry = new FieldTypeRegistry();
        const modelRegistry = new ModelRegistry();
        privates.set(this, {fieldTypeRegistry, modelRegistry});
        _loadBuildInFieldTypes(this);
    }

    setConnection(conn: DatabaseConnection) {
        privates.get(this).conn = conn;
    }

    isModelDefined(modelName: string) {
        return _getModelRegistry(this).hasModel(modelName);
    }

    defineModel(schemaDefinition: any) {
        let that = this;
        let model = new Model(schemaDefinition, (model: Model) => _getConnection(that).getDBO().collection(model.getName()), () => _getFieldTypeRegistry(that));
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
}

function _getModelRegistry(that: ModelService): ModelRegistry {
    return privates.get(that).modelRegistry;
}

function _getFieldTypeRegistry(that: ModelService) {
    return privates.get(that).fieldTypeRegistry;
}


