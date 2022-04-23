import FieldValidationError from './FieldValidationError';

export default class RecordValidationError extends Error {
  readonly #collectionName: string;

  readonly #recordId: string | undefined;

  readonly #fieldErrors: any[] = [];

  constructor(
    collectionName: any,
    recordId: string | undefined,
    fieldErrors: any[]
  ) {
    super(
      `Record validation error in collection ${collectionName} with id ${recordId}`
    );
    this.name = 'RecordValidationError';
    this.#collectionName = collectionName;
    this.#recordId = recordId;
    this.#fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, RecordValidationError.prototype);
  }

  toJSON(): any {
    const result: any = {};
    result.collection = this.#collectionName;
    result.recordId = this.#recordId;
    result.fieldErrors = this.#fieldErrors.map(
      (fieldError: FieldValidationError) => {
        return fieldError.toJSON();
      }
    );
    return result;
  }
}
