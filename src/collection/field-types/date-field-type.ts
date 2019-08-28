import DataType from "../data-types/data-type";
import FieldType from "./field-type";
import DateDataType from "../data-types/date-data-type";

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
