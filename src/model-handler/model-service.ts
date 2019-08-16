import * as mongoose from "mongoose";
import DatabaseConnection from "../database/model/database-connection";
import FieldDefinitionRegistry from "../database/field-definition-registry";

function areDuplicatesPresent(a: []) {
    for (let i = 0; i <= a.length; i++) {
        for (let j = i; j <= a.length; j++) {
            if (i != j && a[i] == a[j]) {
                return true;
            }
        }
    }
    return false;
}

export default class ModelService {

    private conn: DatabaseConnection;

    private fieldDefinitionRegistry: FieldDefinitionRegistry;

    constructor(conn: DatabaseConnection, fieldDefinitionRegistry: FieldDefinitionRegistry) {
        this.conn = conn;
        this.fieldDefinitionRegistry = fieldDefinitionRegistry;
    }

    validateSchema(schemaDefinition: any) {
        if (!schemaDefinition)
            throw new Error("ModelService::validateSchema definition not provided");
        if (!schemaDefinition.name)
            throw new Error("ModelService::validateSchema invalid model name");
        if (schemaDefinition.fields) {
            for (const field of schemaDefinition.fields) {
                if (!field || !field.name || !field.type)
                    throw new Error("ModelService::validateSchema field name or type are provided - " + schemaDefinition.name);
                let fieldDefinition = this.fieldDefinitionRegistry.getFieldDefinition(field.type);
                if (!fieldDefinition)
                    throw new Error("ModelService::validateSchema no such field type :: " + schemaDefinition.name + " :: " + field.name);
                if (!fieldDefinition.validate(field))
                    throw new Error("ModelService::validateSchema invalid field definition :: " + schemaDefinition.name + " :: " + field.name);
            }
            const fieldNames = schemaDefinition.fields.map((f:any) => f.name);
            if(areDuplicatesPresent(fieldNames))
                throw new Error("ModelService::validateSchema duplicate field name" + fieldNames);
        }
        return false;
    }


    isModelDefined(modelName: string) {
        return this.conn.isModelDefined(modelName);
    }

    defineModel(schemaDefinition: any) {
        this.validateSchema(schemaDefinition);
        let schema = this.converterToSchema(schemaDefinition);
        let model = this.conn.defineModel(schemaDefinition.name, schema);
        // @ts-ignore
        model['definition'] = schemaDefinition;
    }

    removeModel(modelName: string) {
        this.conn.removeModel(modelName);
    }

    model(modelName: any) {
        return this.conn.model(modelName);
    }

    private converterToSchema(definition: any): mongoose.Schema {
        let that = this;
        let mongooseSchemaDefinition = <any>{};
        if (definition.fields) {
            definition.fields.forEach(function (fieldDef: any) {
                if (fieldDef.name === 'id' || fieldDef.name === 'created_at' || fieldDef.name === 'updated_at')
                    return;
                // @ts-ignore
                mongooseSchemaDefinition[fieldDef.name] = that.fieldDefinitionRegistry.getFieldDefinition(fieldDef.type).getProperties(fieldDef);
            });
        }
        let mongooseSchema = new mongoose.Schema(mongooseSchemaDefinition, {
            "toObject": {
                "virtuals": true
            },
            "timestamps": {
                "createdAt": "created_at",
                "updatedAt": "updated_at"
            }
        });
        mongooseSchema.virtual('id').set((id: string) => {
            // @ts-ignore
            this._id = new mongoose.Types.ObjectId(id);
        });
        return mongooseSchema;
    }
}
