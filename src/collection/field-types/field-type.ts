import DataType from "../data-types/data-type";

export default abstract class FieldType {

    abstract getDataType(fieldDefinition: any): DataType;

    abstract getType(): string;

    abstract validateDefinition(fieldDefinition: any): boolean;

}
