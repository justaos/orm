import DataType from "../../core/data-types/dataType.interface";
import ObjectDataType from "../../core/data-types/objectDataType";
import FieldType from "../FieldType.interface";

export default class ObjectFieldType implements FieldType {

    getDataType(): DataType {
        return new ObjectDataType();
    }

    getType(): string {
        return "object"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }
}
