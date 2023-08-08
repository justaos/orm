import FieldType from "../FieldType.ts";
import ODM from "../../ODM.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";
import Schema from "../../collection/Schema.ts";

export default class StringFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.STRING);
  }

  getName(): string {
    return "string";
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any,
  ): any {
    return value;
  }

  async validateValue(schema: Schema, fieldName: string, record: any) {
    FieldType.requiredValidation(schema, fieldName, record);
    await FieldType.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      record,
    );
  }


  // deno-lint-ignore require-await
  async getDisplayValue(_schema: Schema, fieldName: string, record: any) {
    return this.getDataType().toJSON(record[fieldName]);
  }
}
