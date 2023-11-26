import DataType from "../field-types/DataType.ts";
import TableSchema from "./TableSchema.ts";
import {
  ColumnSchemaDefinition,
  ColumnSchemaDefinitionStrict
} from "./definitions/ColumnSchemaDefinition.ts";

export default class ColumnSchema {
  readonly #tableSchema: TableSchema;

  readonly #columnSchemaDefinition: ColumnSchemaDefinitionStrict;

  readonly #fieldType?: DataType;

  constructor(
    schema: TableSchema,
    columnSchemaDefinition: ColumnSchemaDefinitionStrict,
    dataType?: DataType
  ) {
    this.#tableSchema = schema;
    this.#columnSchemaDefinition = columnSchemaDefinition;
    this.#fieldType = dataType;
  }

  static setDefaults(
    columnSchemaDefinition: ColumnSchemaDefinition
  ): ColumnSchemaDefinition {
    return {
      not_null: false,
      unique: false,
      ...columnSchemaDefinition
    };
  }

  getName(): string {
    return this.#columnSchemaDefinition.name;
  }

  getType(): string {
    return this.#columnSchemaDefinition.type;
  }

  getDefinition(): ColumnSchemaDefinitionStrict {
    return {
      ...this.#columnSchemaDefinition
    };
  }

  getDefaultValue(): any {
    return this.#columnSchemaDefinition.default;
  }

  getColumnType(): DataType {
    if (!this.#fieldType) {
      throw Error("No such field type");
    }
    return this.#fieldType;
  }

  validate(): string[] {
    const errorMessages: string[] = [];

    /*
     * Validate column name
     */
    if (!this.getName() || typeof this.getName() !== "string") {
      errorMessages.push(`Invalid column not provided`);
    } else if (!/^[a-z0-9_]+$/i.test(this.getName())) {
      errorMessages.push(`Column name should be alphanumeric`);
    }

    if (!this.#columnSchemaDefinition || !this.getType()) {
      errorMessages.push(
        `[Column :: ${this.getName()}] Column type not provided`
      );
    }
    if (!this.#fieldType) {
      errorMessages.push(
        `[Column :: ${this.getName()}] No such column type "${this.getType()}"`
      );
    } else if (
      !this.getColumnType().validateDefinition(this.#columnSchemaDefinition)
    ) {
      errorMessages.push("Invalid field definition");
    }
    return errorMessages;
  }

  /* async validateValue(recordObject: any, context: any) {
    const value = recordObject[this.getName()];
    const fieldType = this.getFieldType();
    if (!fieldType.getDataType().validate(value)) {
      throw new FieldValidationError(
        this.getDefinition(),
        value,
        "NOT_VALID_TYPE"
      );
    }
    try {
      await fieldType.validateValue(
        this.tableSchema,
        this.getName(),
        recordObject,
        context
      );
    } catch (err: any) {
      throw new FieldValidationError(this.getDefinition(), value, err.message);
    }
  }*/
}
