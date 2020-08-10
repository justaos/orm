import DataType from "../../core/data-types/dataType.interface";
import ObjectDataType from "../../core/data-types/objectDataType";
import FieldType from "../FieldType.interface";

export default class ObjectFieldType implements FieldType {

    #dataType: DataType = new ObjectDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "object"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, fieldDefinition: any, value: any) {
        return value
    }
}
