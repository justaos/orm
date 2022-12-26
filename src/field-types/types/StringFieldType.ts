import FieldType from "../FieldType.ts";
import FieldTypeUtils from "../FieldTypeUtils.ts";
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
    FieldTypeUtils.requiredValidation(schema, fieldName, record);
    await FieldTypeUtils.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      record,
    );
  }

  async getDisplayValue(schema: Schema, fieldName: string, record: any) {
    return this.getDataType().toJSON(record[fieldName]);
  }
}
