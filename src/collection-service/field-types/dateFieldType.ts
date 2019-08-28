import DataType from "../data-types/dataType";
import FieldType from "./fieldType";
import DateDataType from "../data-types/dateDataType";

export default class DateFieldType implements FieldType {

    getDataType(): DataType {
        return new DateDataType();
    }

    getType(): string {
        return "date"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }
}
