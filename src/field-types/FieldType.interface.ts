import DataType from "../core/data-types/dataType.interface";

export default abstract class FieldType {

    abstract getDataType(fieldDefinition: any): DataType;

    abstract getType(): string;

    abstract validateDefinition(fieldDefinition: any): boolean;

    abstract async getDisplayValue(schema: any, fieldDefinition: any, value: any): Promise<any>;
}
