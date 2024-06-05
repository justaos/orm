import type DataType from "../data-types/DataType.ts";
import type { ColumnDefinition, ColumnDefinitionInternal } from "../types.ts";

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

  validate(): void {
    const error: {
      name: string;
      errors: {
        name?: string;
        value?: any;
        message: string;
      }[];
    } = {
      name: this.getName(),
      errors: [],
    };

    /*
     * Validate column name
     */
    if (!this.getName() || typeof this.getName() !== "string") {
      error.errors.push({
        name: "name",
        value: this.getName(),
        message: "Invalid column name provided",
      });
    } else if (!/^[a-z0-9_]+$/i.test(this.getName())) {
      error.errors.push({
        name: "name",
        value: this.getName(),
        message: "Column name should be alphanumeric",
      });
    }

    if (!this.getType()) {
      error.errors.push({
        name: "type",
        value: this.getType(),
        message: "Column type not provided",
      });
    } else if (!this.#dataType) {
      error.errors.push({
        name: "type",
        value: this.getType(),
        message: `No such column type "${this.getType()}"`,
      });
    } else {
      try {
        this.getColumnType().validateDefinition(this.#columnDefinition);
      } catch (e) {
        error.errors.push({
          message: e.message,
        });
      }
    }

    if (error.errors.length > 0) {
      throw error;
    }
  }
}
