export default class FieldValidationError extends Error {
  code: string;

  fieldDefinition: any;

  value: string;

  constructor(fieldDefinition: string, value: string, code: string) {
    super();
    this.name = 'FieldValidationError';
    this.fieldDefinition = fieldDefinition;
    this.value = value;
    this.code = code;
    Object.setPrototypeOf(this, FieldValidationError.prototype);
  }

  toJSON() {
    const result: any = {};
    result.code = this.code;
    result.fieldDefinition = this.fieldDefinition;
    result.value = this.value;
    return result;
  }
}
