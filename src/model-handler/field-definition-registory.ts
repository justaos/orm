import FieldDefinition from "./model/field-definition";
import * as mongoose from "mongoose";
import {FIELDS_TYPES} from "./constants";

const fieldDefinitions = new Map<string, FieldDefinition>();

function registerFieldDefinition(fieldDefinition: FieldDefinition) {
    fieldDefinitions.set(fieldDefinition.getType(), fieldDefinition)
}

registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.ID, mongoose.Schema.Types.ObjectId, (field: any, fieldDefinition: FieldDefinition) => {
    return true;
}, function (field: any, fieldDefinition: FieldDefinition) {
    return {
        type: fieldDefinition.getDataType()
    }
}));

registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.STRING, mongoose.Schema.Types.String, (field: any, fieldDefinition: FieldDefinition) => {
    return true;
}, (field: any, fieldDefinition: FieldDefinition) => {
    return {
        type: fieldDefinition.getDataType()
    }
}));

registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.INTEGER, mongoose.Schema.Types.Number, (field: any, fieldDefinition: FieldDefinition) => {
    return true;
}, function (field: any, fieldDefinition: FieldDefinition) {
    return {
        type: fieldDefinition.getDataType()
    }
}));

registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.BOOLEAN, mongoose.Schema.Types.Boolean, (field: any, fieldDefinition: FieldDefinition) => {
    return true;
}, function (field: any, fieldDefinition: FieldDefinition) {
    return {
        type: fieldDefinition.getDataType()
    }
}));

registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.REFERENCE, mongoose.Schema.Types.ObjectId, (field: any, fieldDefinition: FieldDefinition) => {
    return !!field.ref;
}, function (field: any, fieldDefinition: FieldDefinition) {
    return {
        type: fieldDefinition.getDataType(),
        ref: field.ref
    }
}));

export default fieldDefinitions;
