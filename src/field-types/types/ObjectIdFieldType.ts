import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import ObjectIdDataType from "../../core/data-types/objectIdDataType";

export default class ObjectIdFieldType implements FieldType {

    getDataType(): DataType {
        return new ObjectIdDataType();
    }

    getType(): string {
        return "objectId"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(fieldDefinition: any, value: any) {
        return value
    }
}
