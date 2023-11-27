import { mongodb } from "../../../deps.ts";

import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import ODM from "../../ODM.ts";
import PrimitiveDataType from "../../core/data-types/PrimitiveDataType.ts";
import ObjectIdDataType from "../../core/data-types/types/ObjectIdDataType.ts";

export default class ObjectIdFieldType extends DataType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.OBJECT_ID);
  }

  getName(): string {
    return "objectId";
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

  async getDisplayValue(
    schema: TableSchema,
    fieldName: string,
    record: any
  ): Promise<string | null> {
    const objectIdType = <ObjectIdDataType>this.getDataType();
    return objectIdType.toJSON(record[fieldName]);
  }

  setValueIntercept(
    schema: TableSchema,
    fieldName: string,
    value: any,
    record: any
  ): mongodb.ObjectId {
    if (typeof value === "string" && mongodb.ObjectId.isValid(value)) {
      return new mongodb.ObjectId(value);
    }
    return value;
  }
}
