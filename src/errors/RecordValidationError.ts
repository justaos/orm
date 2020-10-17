import FieldValidationError from './FieldValidationError';

export default class RecordValidationError extends Error {
  collection: string;

  recordId: string | undefined;

  fieldErrors: any[] = [];

  constructor(
    collection: any,
    recordId: string | undefined,
    fieldErrors: any[],
  ) {
    super();
    this.name = 'RecordValidationError';
    this.collection = collection;
    this.recordId = recordId;
    this.fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, RecordValidationError.prototype);
  }

  toJSON() {
    const result: any = {};
    result.collection = this.collection;
    result.recordId = this.recordId;
    result.fieldErrors = this.fieldErrors.map(function (
      fieldError: FieldValidationError,
    ) {
      return fieldError.toJSON();
    });
    return result;
  }
}
