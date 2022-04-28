import Schema from '../collection/Schema';
import ODM from '../ODM';

export default class FieldTypeUtils {
  static requiredValidation(schema: Schema, fieldName: string, record: any) {
    const field = schema.getField(fieldName);
    if (
      field &&
      field.getDefinition().required &&
      (typeof record[field.getName()] === 'undefined' ||
        record[field.getName()] === '')
    )
      throw new Error('REQUIRED');
  }

  static async uniqueValidation(
    odm: ODM,
    schema: Schema,
    fieldName: string,
    record: any
  ) {
    const value = record[fieldName];
    const field = schema.getField(fieldName);
    if (field && field.getDefinition().unique && typeof value !== 'undefined') {
      const collection = odm.collection(schema.getName());
      const condition = { [field.getName()]: value };
      if (record._id) condition._id = { $ne: record._id };
      const rec = await collection.findOne(condition);
      if (rec) throw new Error('NOT_UNIQUE');
    }
  }
}
