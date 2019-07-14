import * as mongoose from "mongoose";
import DatabaseConnection from "../database/model/database-connection";

class SchemaProperty {
    type: any;
    ref: string | undefined;

    constructor() {
    }

}

const fieldTypesMap = {
    STRING: 'string',
    INTEGER: 'integer',
    ID: 'id',
    BOOLEAN: 'boolean',
    REFERENCE: 'reference'
};

const fieldTypes = Object.values(fieldTypesMap);

export default class ModelService {

    private conn: any;

    constructor(conn: DatabaseConnection) {
        this.conn = conn;
    }

    private static validateSchema(def: any) {
        if (!def)
            return false;
        if (def.fields)
            for (const field of def.fields) {
                if (!field || !field.name || !field.type || !fieldTypes.includes(field.type))
                    return false;
                if (field.type === 'reference' && !field.ref)
                    return false;
            }
        return true;
    }

    isModelDefined(modelName: string) {
        return this.conn.isModelDefined(modelName);
    }

    defineModel(schemaDefinition: any) {
        if (!schemaDefinition)
            return;
        let {name: modelName} = schemaDefinition;
        if (!ModelService.validateSchema(schemaDefinition))
            throw new Error("Invalid Schema definition :: " + modelName);
        let schema = this.converterToSchema(schemaDefinition);
        let model = this.conn.defineModel(modelName, schema);
        model.definition = schemaDefinition;
    }

    model(modelName: any) {
        return this.conn.model(modelName);
    }

    private converterToSchema(definition: any): mongoose.Schema {
        let mongooseSchemaDefinition = <any>{};
        if (definition.fields) {
            definition.fields.forEach(function (fieldDef: any) {
                let property = new SchemaProperty();
                if (fieldDef.name === 'id' || fieldDef.name === 'created_at' || fieldDef.name === 'updated_at')
                    return;

                switch (fieldDef.type) {
                    case fieldTypesMap.STRING :
                        property.type = mongoose.Schema.Types.String;
                        break;
                    case fieldTypesMap.INTEGER :
                        property.type = mongoose.Schema.Types.Number;
                        break;
                    case fieldTypesMap.ID :
                        property.type = mongoose.Schema.Types.ObjectId;
                        break;
                    case fieldTypesMap.BOOLEAN :
                        property.type = mongoose.Schema.Types.Boolean;
                        break;
                    case fieldTypesMap.REFERENCE :
                        if (fieldDef.ref) {
                            property.type = mongoose.Schema.Types.ObjectId;
                            property.ref = fieldDef.ref;
                        } else
                            property.type = mongoose.Schema.Types.String;
                        break;
                    default:
                        property.type = mongoose.Schema.Types.String;
                }
                mongooseSchemaDefinition[fieldDef.name] = property;
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
