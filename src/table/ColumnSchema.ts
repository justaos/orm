import DataType from "../data-types/DataType.ts";
import TableSchema from "./TableSchema.ts";
import {
  ColumnDefinition,
  ColumnDefinitionRaw
} from "./definitions/ColumnDefinition.ts";

export default class ColumnSchema {
  readonly #tableSchema: TableSchema;

  readonly #columnDefinition: ColumnDefinition;

  readonly #fieldType?: DataType;

  constructor(
    schema: TableSchema,
    columnDefinition: ColumnDefinition,
    dataType?: DataType
  ) {
    this.#tableSchema = schema;
    this.#columnDefinition = columnDefinition;
    this.#fieldType = dataType;
  }

  static setDefaults(
    columnDefinition: ColumnDefinitionRaw
  ): ColumnDefinitionRaw {
    return {
      not_null: false,
      unique: false,
      ...columnDefinition
    };
  }

  getName(): string {
    return this.#columnDefinition.name;
  }

  getType(): string {
    return this.#columnDefinition.type;
  }

  getDefinition(): ColumnDefinition {
    return {
      ...this.#columnDefinition
    };
  }

  getDefaultValue(): any {
    return this.#columnDefinition.default;
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
      errorMessages.push(`Invalid column name provided`);
    } else if (!/^[a-z0-9_]+$/i.test(this.getName())) {
      errorMessages.push(`Column name should be alphanumeric`);
    }

    if (!this.#columnDefinition || !this.getType()) {
      errorMessages.push(
        `[Column :: ${this.getName()}] Column type not provided`
      );
    }
    if (!this.#fieldType) {
      errorMessages.push(
        `[Column :: ${this.getName()}] No such column type "${this.getType()}"`
      );
    } else if (
      !this.getColumnType().validateDefinition(this.#columnDefinition)
    ) {
      errorMessages.push("Invalid field definition");
    }
    return errorMessages;
  }
}
