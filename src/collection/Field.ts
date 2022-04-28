import FieldType from '../field-types/FieldType';
import Schema from './Schema';
import FieldValidationError from '../errors/FieldValidationError';

export default class Field {
  readonly #schema: Schema;

  readonly #fieldDefinition: any;

  readonly #fieldType: FieldType | undefined;

  constructor(schema: Schema, fieldDefinition: any, fieldType?: FieldType) {
    this.#fieldDefinition = fieldDefinition;
    this.#fieldType = fieldType;
    this.#schema = schema;
  }

  getName(): string {
    return this.#fieldDefinition.name;
  }

  getDefinition(): any {
    return this.#fieldDefinition;
  }

  getType(): string {
    return this.#fieldDefinition.type;
  }

  getDefaultValue(): any {
    return this.#fieldDefinition.default_value;
  }

  getFieldType(): FieldType {
    if (!this.#fieldType) throw new Error('Field type not found');
    return this.#fieldType;
  }

  validate(): void {
    if (!this.#fieldDefinition || !this.getType())
      throw new Error(`field type not provided`);
    if (!this.#fieldType)
      throw new Error(
        `[Field :: ${this.getName()}] [Type :: ${this.getType()}] No such field type`
      );
    if (!this.#fieldType.validateDefinition(this.#fieldDefinition))
      throw new Error(
        `[Field :: ${this.getName()}] [Type :: ${this.getType()}] Invalid field definition`
      );
  }

  async validateValue(recordObject: any, context: any) {
    const value = recordObject[this.getName()];
    const fieldType = this.getFieldType();
    if (!fieldType.getDataType().validate(value))
      throw new FieldValidationError(
        this.getDefinition(),
        value,
        'NOT_VALID_TYPE'
      );
    try {
      await fieldType.validateValue(
        this.#schema,
        this.getName(),
        recordObject,
        context
      );
    } catch (err: any) {
      throw new FieldValidationError(this.getDefinition(), value, err.message);
    }
  }
}
