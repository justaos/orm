import FieldValidationError from './FieldValidationError';

export default class RecordValidationError extends Error {
  readonly #collection: string;

  readonly #recordId: string | undefined;

  readonly #fieldErrors: any[] = [];

  constructor(
    collection: any,
    recordId: string | undefined,
    fieldErrors: any[]
  ) {
    super();
    this.name = 'RecordValidationError';
    this.#collection = collection;
    this.#recordId = recordId;
    this.#fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, RecordValidationError.prototype);
  }

  toJSON(): any {
    const result: any = {};
    result.collection = this.#collection;
    result.recordId = this.#recordId;
    result.fieldErrors = this.#fieldErrors.map(
      (fieldError: FieldValidationError) => {
        return fieldError.toJSON();
      }
    );
    return result;
  }
}
