import DataType from "../core/data-types/DataType.ts";
import ODM from "../ODM.ts";
import DataTypeFactory from "../core/data-types/DataTypeFactory.ts";
import PrimitiveDataType from "../core/data-types/PrimitiveDataType.ts";
import Schema from "../collection/Schema.ts";

export default abstract class FieldType {
  category: string[] = [];
  readonly #primitiveDataType: PrimitiveDataType;
  readonly #odm: ODM;

  protected constructor(odm: ODM, primitiveDataType: PrimitiveDataType) {
    this.#odm = odm;
    this.#primitiveDataType = primitiveDataType;
  }

  getODM(): ODM {
    return this.#odm;
  }

  getDataType(): DataType {
    return DataTypeFactory.getDataType(this.#primitiveDataType);
  }

  is(category: string): boolean {
    return this.category.includes(category);
  }

  abstract getName(): string;

  abstract validateDefinition(fieldDefinition: any): boolean;

  abstract setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any,
  ): any;

  abstract validateValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any,
  ): Promise<any>;

  abstract getDisplayValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any,
  ): Promise<any>;

  static requiredValidation(schema: Schema, fieldName: string, record: any) {
    const field = schema.getField(fieldName);
    if (
      field &&
      field.getDefinition().required &&
      (typeof record[field.getName()] === "undefined" ||
        record[field.getName()] === "")
    ) {
      throw new Error("REQUIRED");
    }
  }

  static async uniqueValidation(
    odm: ODM,
    schema: Schema,
    fieldName: string,
    record: any,
  ) {
    const value = record[fieldName];
    const field = schema.getField(fieldName);
    if (field && field.getDefinition().unique && typeof value !== "undefined") {
      const collection = odm.collection(schema.getName());
      const condition = { [field.getName()]: value };
      if (record._id) condition._id = { $ne: record._id };
      const rec = await collection.findOne(condition);
      if (rec) throw new Error("NOT_UNIQUE");
    }
  }
}
