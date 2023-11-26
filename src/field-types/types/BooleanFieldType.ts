import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import ODM from "../../ODM.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";

export default class BooleanFieldType extends DataType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.BOOLEAN);
  }

  getName(): string {
    return "boolean";
  }

  async validateValue(
    schema: TableSchema,
    fieldName: string,
    value: any,
    context: any
  ) {
    DataType.requiredValidation(schema, fieldName, value);
    await DataType.uniqueValidation(this.getODM(), schema, fieldName, value);
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(schema: TableSchema, fieldName: string, record: any) {
    return this.getDataType().toJSON(record[fieldName]);
  }

  setValueIntercept(
    schema: TableSchema,
    fieldName: string,
    value: any,
    record: any
  ): any {
    return value;
  }
}
