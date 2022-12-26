import { mongodb } from "../../../deps.ts";

import FieldType from "../FieldType.ts";
import Schema from "../../collection/Schema.ts";
import ODM from "../../ODM.ts";
import FieldTypeUtils from "../FieldTypeUtils.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";
import ObjectIdDataType from "../../core/data-types/types/ObjectIdDataType.ts";

export default class ObjectIdFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.OBJECT_ID);
  }

  getName(): string {
    return "objectId";
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

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(
    schema: Schema,
    fieldName: string,
    record: any,
  ): Promise<string | null> {
    const objectIdType = <ObjectIdDataType> this.getDataType();
    return objectIdType.toJSON(record[fieldName]);
  }

  setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any,
  ): mongodb.ObjectId {
    if (typeof value === "string" && mongodb.ObjectId.isValid(value)) {
      return new mongodb.ObjectId(value);
    }
    return value;
  }
}
