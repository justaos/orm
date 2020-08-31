import DataType from "../core/data-types/dataType.interface";
import Schema from "../collection/Schema";
import Field from "../collection/Field";

export default abstract class FieldType {

    abstract getDataType(): DataType;

    abstract getType(): string;

    abstract validateDefinition(fieldDefinition: any): boolean;

    abstract getValueIntercept(schema: Schema, field: Field, value: any, context: any): any;

    abstract setValueIntercept(schema: Schema, field: Field, value: any, context: any): any;

    abstract async getDisplayValue(schema: Schema, field: Field, value: any, context: any): Promise<any>;

    abstract validateValue(fieldDefinition: any, value: any): Promise<any>;
}
