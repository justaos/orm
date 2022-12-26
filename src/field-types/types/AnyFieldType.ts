import FieldType from "../FieldType.ts";
import Schema from "../../collection/Schema.ts";
import FieldTypeUtils from "../FieldTypeUtils.ts";
import ODM from "../../ODM.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";

export default class AnyFieldType extends FieldType {
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
    schema: Schema,
    fieldName: string,
    record: any,
    context: any,
  ) {
    FieldTypeUtils.requiredValidation(schema, fieldName, record);
    await FieldTypeUtils.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      record,
    );
  }

  async getDisplayValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any,
  ) {
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
