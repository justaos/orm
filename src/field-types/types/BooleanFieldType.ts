import FieldType from "../FieldType.ts";
import Schema from "../../collection/Schema.ts";
import ODM from "../../ODM.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";

export default class BooleanFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.BOOLEAN);
  }

  getName(): string {
    return "boolean";
  }

  async validateValue(
    schema: Schema,
    fieldName: string,
    value: any,
    context: any,
  ) {
    FieldType.requiredValidation(schema, fieldName, value);
    await FieldType.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      value,
    );
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(schema: Schema, fieldName: string, record: any) {
    return this.getDataType().toJSON(record[fieldName]);
  }

  setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any,
  ): any {
    return value;
  }
}
