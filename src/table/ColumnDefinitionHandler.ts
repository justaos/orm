import DataType from "../data-types/DataType.ts";
import { ColumnDefinition, ColumnDefinitionInternal } from "../types.ts";

export default class ColumnDefinitionHandler {
  readonly #columnDefinition: ColumnDefinitionInternal;

  readonly #dataType?: DataType;

  constructor(columnDefinition: ColumnDefinition, dataType?: DataType) {
    this.#dataType = dataType;
    this.#columnDefinition = ColumnDefinitionHandler.setDefaults(
      columnDefinition,
      dataType,
    );
  }

  static setDefaults(
    columnDefinition: ColumnDefinition,
    dataType?: DataType,
  ): ColumnDefinitionInternal {
    return {
      not_null: false,
      unique: false,
      data_type: dataType?.getName(),
      ...columnDefinition,
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

  getDefinitionClone(): ColumnDefinitionInternal {
    return {
      ...this.#columnDefinition,
    };
  }

  getDefaultValue(): any {
    return this.#columnDefinition.default;
  }

  getColumnType(): DataType {
    if (!this.#dataType) {
      throw Error("No such field type");
    }
    return this.#dataType;
  }

  validate(): string[] {
    const errorMessages: string[] = [];

    /*
     * Validate column name
     */
    if (!this.getName() || typeof this.getName() !== "string") {
      errorMessages.push(
        `[Column :: ${this.getName()}] Invalid column name provided`,
      );
    } else if (!/^[a-z0-9_]+$/i.test(this.getName())) {
      errorMessages.push(
        `[Column :: ${this.getName()}] Column name should be alphanumeric`,
      );
    }

    if (!this.#columnDefinition || !this.getType()) {
      errorMessages.push(
        `[Column :: ${this.getName()}] Column type not provided`,
      );
    }
    if (!this.#dataType) {
      errorMessages.push(
        `[Column :: ${this.getName()}] No such column type "${this.getType()}"`,
      );
    } else if (
      !this.getColumnType().validateDefinition(this.#columnDefinition)
    ) {
      errorMessages.push(
        `[Column :: ${this.getName()}] Invalid field definition`,
      );
    }
    return errorMessages;
  }
}
