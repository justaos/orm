import DataType from "../DataType.ts";
import ODM from "../../ODM.ts";
import TableSchema from "../../table/TableSchema.ts";

export default class StringFieldType extends DataType {
  constructor(odm: ODM) {
    super("VARCHAR");
  }

  getName(): string {
    return "string";
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  setValueIntercept(
    schema: TableSchema,
    fieldName: string,
    value: any,
    record: any
  ): any {
    return value;
  }

  async validateValue(schema: TableSchema, fieldName: string, record: any) {
    // DataType.requiredValidation(schema, fieldName, record);
    // await DataType.uniqueValidation(this.getODM(), schema, fieldName, record);
  }

  // deno-lint-ignore require-await
  async getDisplayValue(_schema: TableSchema, fieldName: string, record: any) {
    return record[fieldName];
  }
}
