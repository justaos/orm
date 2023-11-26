import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import ODM from "../../ODM.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";

export default class AnyFieldType extends DataType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.ANY);
  }

  getName(): string {
    return "any";
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async validateValue(
    schema: TableSchema,
    fieldName: string,
    record: any,
    context: any
  ) {
    DataType.requiredValidation(schema, fieldName, record);
    await DataType.uniqueValidation(this.getODM(), schema, fieldName, record);
  }

  async getDisplayValue(
    schema: TableSchema,
    fieldName: string,
    record: any,
    context: any
  ) {
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
