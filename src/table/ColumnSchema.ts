import DataType from "../data-types/DataType.ts";
import TableSchema from "./TableSchema.ts";
import { ColumnDefinition, ColumnDefinitionRaw } from "../types.ts";

export default class ColumnSchema {
  readonly #columnDefinition: ColumnDefinition;

  readonly #fieldType?: DataType;

  constructor(schema: TableSchema, columnDefinition: ColumnDefinition) {
    this.#columnDefinition = columnDefinition;
    this.#fieldType = schema.getDataType(columnDefinition.type);
    this.#columnDefinition.data_type = this.#fieldType?.getName();
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

  isUnique(): boolean {
    return !!this.#columnDefinition.unique;
  }

  isNotNull(): boolean {
    return !!this.#columnDefinition.not_null;
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
