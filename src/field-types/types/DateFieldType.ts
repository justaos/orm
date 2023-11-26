import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import ODM from "../../ODM.ts";
import { DateUtils } from "../../../deps.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";

export default class DateFieldType extends DataType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.DATE);
  }

  getName(): string {
    return "date";
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
      const date = new Date(value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
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
