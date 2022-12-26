export default class FieldValidationError extends Error {
  readonly #code: string;

  readonly #fieldDefinition: any;

  readonly #value: string;

  constructor(fieldDefinition: string, value: string, code: string) {
    super(`FieldValidationError: ${fieldDefinition} ${value} ${code}`);
    this.name = "FieldValidationError";
    this.#fieldDefinition = fieldDefinition;
    this.#value = value;
    this.#code = code;
    Object.setPrototypeOf(this, FieldValidationError.prototype);
  }

  toJSON(): any {
    const result: any = {};
    result.code = this.#code;
    result.fieldDefinition = this.#fieldDefinition;
    result.value = this.#value;
    return result;
  }
}
