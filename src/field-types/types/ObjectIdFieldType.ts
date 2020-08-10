import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import ObjectIdDataType from "../../core/data-types/objectIdDataType";

export default class ObjectIdFieldType implements FieldType {

    #dataType: DataType = new ObjectIdDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "objectId"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, fieldDefinition: any, value: any) {
        return this.#dataType.toJSON(value);
    }
}
