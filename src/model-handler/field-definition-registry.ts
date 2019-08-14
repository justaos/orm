import {FieldDefinition} from "./model/field-definition";
import {FIELDS_TYPES, MONGOOSE_TYPES} from "../constants";


export default class FieldDefinitionRegistry {
    fieldDefinitions: Map<string, FieldDefinition>;

    constructor() {
        this.fieldDefinitions = new Map<string, FieldDefinition>();
        this.registerDefaultTypes();
    }

    registerFieldDefinition(fieldDefinition: FieldDefinition) {
        this.fieldDefinitions.set(fieldDefinition.getType(), fieldDefinition)
    }

    getFieldDefinition(type: string) {
        return this.fieldDefinitions.get(type);
    }

    registerDefaultTypes() {

        this.registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.ID, (field: any, fieldDefinition: FieldDefinition) => {
            return true;
        }, function (field: any, fieldDefinition: FieldDefinition) {
            return {
                type: MONGOOSE_TYPES.OBJECTID
            }
        }));

        this.registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.STRING, (field: any, fieldDefinition: FieldDefinition) => {
            return true;
        }, (field: any, fieldDefinition: FieldDefinition) => {
            return {
                type: MONGOOSE_TYPES.STRING
            }
        }));

        this.registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.INTEGER, (field: any, fieldDefinition: FieldDefinition) => {
            return true;
        }, function (field: any, fieldDefinition: FieldDefinition) {
            return {
                type: MONGOOSE_TYPES.NUMBER
            }
        }));

        this.registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.BOOLEAN, (field: any, fieldDefinition: FieldDefinition) => {
            return true;
        }, function (field: any, fieldDefinition: FieldDefinition) {
            return {
                type: MONGOOSE_TYPES.BOOLEAN
            }
        }));

        this.registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.REFERENCE, (field: any, fieldDefinition: FieldDefinition) => {
            return !!field.ref;
        }, function (field: any, fieldDefinition: FieldDefinition) {
            return {
                type: MONGOOSE_TYPES.OBJECTID,
                ref: field.ref
            }
        }));

        this.registerFieldDefinition(new FieldDefinition(FIELDS_TYPES.DATE, (field: any, fieldDefinition: FieldDefinition) => {
            return true;
        }, function (field: any, fieldDefinition: FieldDefinition) {
            return {
                type: MONGOOSE_TYPES.DATE
            }
        }));
    }


};
