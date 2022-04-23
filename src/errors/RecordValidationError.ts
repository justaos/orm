import FieldValidationError from './FieldValidationError';

export default class RecordValidationError extends Error {
  readonly #collectionDefinition: any;

  readonly #recordId: string | undefined;

  readonly #fieldErrors: any[] = [];

  constructor(
    collectionDefinition: any,
    recordId: string | undefined,
    fieldErrors: any[]
  ) {
    super(
      `Record validation error in collection ${collectionDefinition.name} with id ${recordId}`
    );
    this.name = 'RecordValidationError';
    this.#collectionDefinition = collectionDefinition;
    this.#recordId = recordId;
    this.#fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, RecordValidationError.prototype);
  }

  toJSON(): any {
    const result: any = {};
    result.collectionDefinition = this.#collectionDefinition;
    result.recordId = this.#recordId;
    result.fieldErrors = this.#fieldErrors.map(
      (fieldError: FieldValidationError) => {
        return fieldError.toJSON();
      }
    );
    return result;
  }
}
