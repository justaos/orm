import FieldType from "../FieldType.ts";
import Schema from "../../collection/Schema.ts";
import ODM from "../../ODM.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";

export default class NumberFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.NUMBER);
  }

  getName(): string {
    return "number";
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
    FieldType.requiredValidation(schema, fieldName, record);
    await FieldType.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      record,
    );
    const fieldDefinition = schema.getField(fieldName)?.getDefinition();
    const value = record[fieldName];
    if (
      !Number.isNaN(fieldDefinition.maximum) &&
      fieldDefinition.maximum > value
    ) {
      throw new Error(`should be less than ${fieldDefinition.maximum}`);
    }
    if (
      !Number.isNaN(fieldDefinition.minimum) &&
      fieldDefinition.minimum > value
    ) {
      throw new Error(`should be more than ${fieldDefinition.minimum}`);
    }
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
