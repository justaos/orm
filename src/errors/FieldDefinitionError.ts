import Field from '../collection/Field';

export default class FieldDefinitionError extends Error {
  constructor(field: Field, message: string) {
    super(
      `[Collection :: ${field.getCollectionName()}] [Field :: ${field.getName()}] [Type :: ${field.getType()}] ${message}`
    );
  }
}
