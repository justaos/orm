import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import ODM from "../../ODM.ts";
import { DateUtils } from "../../../deps.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";

export default class DateTimeFieldType extends DataType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.DATE_TIME);
  }

  getName(): string {
    return "datetime";
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

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  setValueIntercept(
    schema: TableSchema,
    fieldName: string,
    value: any,
    record: any
  ): any {
    if (typeof value === "string" && DateUtils.isIsoDate(value)) {
      return new Date(value);
    }
    return value;
  }

  async getDisplayValue(
    schema: TableSchema,
    fieldName: string,
    record: any,
    context: any
  ) {
    return this.getDataType().toJSON(record[fieldName]);
  }
}
