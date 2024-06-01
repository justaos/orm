import { CommonUtils } from "../../deps.ts";
import {
  ColumnDefinition,
  TableDefinition,
  TableDefinitionRaw,
} from "../types.ts";
import Registry from "../Registry.ts";
import ColumnSchema from "./ColumnSchema.ts";
import DataType from "../data-types/DataType.ts";

import TableDefinitionError from "../errors/TableDefinitionError.ts";
import TableNameUtils from "./TableNameUtils.ts";

export default class TableSchema {
  readonly #definition: TableDefinition;

  readonly #fieldTypeRegistry: Registry<DataType>;

  readonly #tableDefinitionRegistry: Registry<TableDefinition>;

  constructor(
    tableDefinition: TableDefinitionRaw,
    fieldTypeRegistry: Registry<DataType>,
    tableDefinitionRegistry: Registry<TableDefinition>,
  ) {
    this.#fieldTypeRegistry = fieldTypeRegistry;
    this.#tableDefinitionRegistry = tableDefinitionRegistry;
    this.#definition = TableSchema.setDefaults(tableDefinition);
  }

  static setDefaults(tableDefinition: TableDefinitionRaw): TableDefinition {
    tableDefinition = {
      final: false,
      columns: [],
      schema: "public",
      ...tableDefinition,
    };

    if (tableDefinition.inherits) {
      tableDefinition.inherits = TableNameUtils.getShortFormTableName(
        tableDefinition.inherits,
      );
    }

    if (tableDefinition.columns) {
      for (let i = 0; i < tableDefinition.columns.length; i++) {
        tableDefinition.columns[i] = ColumnSchema.setDefaults(
          tableDefinition.columns[i],
        );
      }
    }

    return <TableDefinition>tableDefinition;
  }

  static getTableName(fullName: string): string {
    const parts = fullName.split(".");
    let tableName = fullName;
    if (parts.length == 2) {
      tableName = parts[1];
    }
    return tableName;
  }

  getName(): string {
    return TableNameUtils.getShortFormTableName(
      `${this.#definition.schema}.${this.#definition.name}`,
    );
  }

  getTableName(): string {
    return this.#definition.name;
  }

  getSchemaName(): string {
    return this.#definition.schema;
  }

  getInherits(): string | undefined {
    return this.#definition.inherits;
  }

  isFinal(): boolean {
    if (this.#definition.final === undefined) return false;
    return this.#definition.final;
  }

  getDefinition(): TableDefinition {
    return {
      ...this.#definition,
      columns: this.#definition.columns?.map((column: ColumnDefinition) => {
        return {
          ...column,
        };
      }),
    };
  }

  getExtendedTables(): string[] {
    let extendedTables = [this.getName()];
    const extendsTableName = this.getInherits();
    if (extendsTableName) {
      extendedTables = extendedTables.concat(
        this.#getTableSchema(extendsTableName).getExtendedTables(),
      );
    }
    return extendedTables;
  }

  getBaseName(): string {
    let hostName = this.getName();
    const extendsTableName = this.getInherits();
    if (extendsTableName) {
      const extendedSchema = this.#getTableSchema(extendsTableName);
      hostName = extendedSchema.getBaseName();
    }
    return hostName;
  }

  getDataType(name: string): DataType | undefined {
    return this.#fieldTypeRegistry.get(name);
  }

  getOwnColumnSchemas(): ColumnSchema[] {
    const columns: ColumnSchema[] = [];
    const extendsTableName = this.getInherits();
    if (!extendsTableName) {
      columns.push(
        new ColumnSchema(this, {
          name: "id",
          type: "uuid",
          not_null: true,
          unique: true,
        }),
        new ColumnSchema(this, {
          name: "_table",
          type: "string",
          not_null: true,
          unique: false,
        }),
      );
    }
    columns.push(
      ...this.#definition.columns.map((column: ColumnDefinition) => {
        return new ColumnSchema(this, column);
      }),
    );
    return columns;
  }

  getColumnSchemas(): ColumnSchema[] {
    const allFields: ColumnSchema[] = this.getOwnColumnSchemas();

    const extendsTableName = this.getInherits();
    if (
      extendsTableName &&
      this.#tableDefinitionRegistry.has(extendsTableName)
    ) {
      const extendedSchema = this.#getTableSchema(extendsTableName);
      allFields.push(...extendedSchema.getColumnSchemas());
    }
    return allFields;
  }

  getColumnNames(): string[] {
    return this.getColumnSchemas().map((f) => f.getName());
  }

  getOwnColumnNames(): string[] {
    return this.getOwnColumnSchemas().map((f) => f.getName());
  }

  getColumnSchema(name: string): ColumnSchema | undefined {
    return this.getColumnSchemas().find((field) => field.getName() === name);
  }

  validate() {
    let errorMessages: string[] = [];

    /*
     * Validate table name
     */
    if (!this.#definition.name || typeof this.#definition.name !== "string") {
      errorMessages.push(`Invalid table name provided`);
    } else if (!/^[a-z0-9_]+$/i.test(this.#definition.name)) {
      errorMessages.push(`Table name should be alphanumeric`);
    } else if (this.#tableDefinitionRegistry.has(this.getName())) {
      errorMessages.push(`Table name already exists`);
    }

    /*
     * Validate extends
     */
    const extendsTableName = this.getInherits();
    if (typeof extendsTableName === "string") {
      if (!this.#tableDefinitionRegistry.has(extendsTableName)) {
        errorMessages.push(
          `${this.getName()} cannot extend '${extendsTableName}'. '${this.getInherits()}' does not exists.`,
        );
      } else {
        const extendsCol: TableSchema = this.#getTableSchema(extendsTableName);
        if (extendsCol.isFinal()) {
          errorMessages.push(
            `${this.getName()} cannot extend '${extendsTableName}'. '${this.getInherits()}' is final table schema.`,
          );
        }
      }
    }

    /*
     * Validate columns
     */
    const columnSchemas = this.getOwnColumnSchemas();
    for (const columnSchema of columnSchemas) {
      errorMessages = errorMessages.concat(columnSchema.validate());
    }

    const allColumnNames: string[] = this.getColumnSchemas().map((f) =>
      f.getName(),
    );
    const duplicates = CommonUtils.findDuplicates(allColumnNames);
    if (duplicates.length) {
      errorMessages.push(`Duplicate fields -> ${duplicates.join(",")}`);
    }

    if (errorMessages.length) {
      throw new TableDefinitionError(this.#definition, errorMessages);
    }
  }

  #getTableSchema(tableName: string): TableSchema {
    const schema = this.#tableDefinitionRegistry.get(tableName);
    if (!schema) {
      throw Error(`[Schema::_getSchema] Schema not found :: ${tableName}`);
    }
    return new TableSchema(
      schema,
      this.#fieldTypeRegistry,
      this.#tableDefinitionRegistry,
    );
  }
}
