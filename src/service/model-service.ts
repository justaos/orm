import * as mongoose from "mongoose";
import DatabaseConnection from "../model/database-connection";

export default class ModelService {

    private conn: any;

    constructor(conn: DatabaseConnection) {
        this.conn = conn;
    }

    isModelDefined(modelName: string) {
        return this.conn.isModelDefined(modelName);
    }

    defineModel(schemaDefinition: any) {
        let modelName = schemaDefinition.name;
        let schema = this.converterToSchema(schemaDefinition);
        let model = this.conn.defineModel(modelName, schema);
        model.definition = schemaDefinition;
    }

    private converterToSchema(definition: any): mongoose.Schema {
        let mongooseSchemaDefinition = <any>{};
        if (definition.fields) {
            definition.fields.forEach(function (fieldDef: any) {
                let property = <any>{};
                if (fieldDef.name === 'id' || fieldDef.name === 'created_at' || fieldDef.name === 'updated_at') {
                    return;
                }
                switch (fieldDef.type) {
                    case 'string' :
                        property.type = mongoose.Schema.Types.String;
                        break;
                    case 'integer' :
                        property.type = mongoose.Schema.Types.Number;
                        break;
                    case 'id' :
                        property.type = mongoose.Schema.Types.ObjectId;
                        break;
                    case 'boolean' :
                        property.type = mongoose.Schema.Types.Boolean;
                        break;
                    case 'reference' :
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
