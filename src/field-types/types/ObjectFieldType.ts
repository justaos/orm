import FieldType from "../FieldType.ts";
import Schema from "../../collection/Schema.ts";
import ODM from "../../ODM.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";

export default class ObjectFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.OBJECT);
  }

  getName(): string {
    return "object";
  }

  async validateValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any,
  ): Promise<void> {
    FieldType.requiredValidation(schema, fieldName, record);
    await FieldType.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      record,
    );
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any,
  ): Promise<any> {
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
