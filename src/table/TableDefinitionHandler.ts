import { CommonUtils } from "../../deps.ts";
import {
  ColumnDefinitionInternal,
  TableDefinition,
  TableDefinitionInternal,
} from "../types.ts";
import ColumnDefinitionHandler from "./ColumnDefinitionHandler.ts";

import TableDefinitionError from "../errors/TableDefinitionError.ts";
import { getShortFormTableName } from "../utils.ts";
import Column from "./Column.ts";
import RegistriesHandler from "../RegistriesHandler.ts";

export default class TableDefinitionHandler {
  readonly #tableDefinition: TableDefinitionInternal;

  readonly #registriesHandler: RegistriesHandler;

  readonly #columnsMap: { [key: string]: Column } = {};

  constructor(
    tableDefinition: TableDefinition,
    registriesHandler: RegistriesHandler,
  ) {
    this.#registriesHandler = registriesHandler;
    this.#tableDefinition = this.setDefaults(tableDefinition);
  }

  static getTableName(fullName: string): string {
    const parts = fullName.split(".");
    let tableName = fullName;
    if (parts.length == 2) {
      tableName = parts[1];
    }
    return tableName;
  }

  setDefaults(tableDefinition: TableDefinition): TableDefinitionInternal {
    tableDefinition = {
      final: false,
      columns: [],
      schema: "public",
      ...tableDefinition,
    };

    if (tableDefinition.inherits) {
      tableDefinition.inherits = getShortFormTableName(
        tableDefinition.inherits,
      );
    }

    if (tableDefinition.columns) {
      for (let i = 0; i < tableDefinition.columns.length; i++) {
        const column = new Column(
          tableDefinition.columns[i],
          this.#registriesHandler,
        );
        this.#columnsMap[column.getName()] = column;
        tableDefinition.columns[i] = column.getDefinitionClone();
      }
    }

    return <TableDefinitionInternal>tableDefinition;
  }

  /**
   * Returns the short form of the table name.
   * @returns {string}
   *
   * @example
   * ("public.users"); // "users"
   * ("some_schema.tasks"); // "some_schema.tasks"
   */
  getName(): string {
    return getShortFormTableName(
      `${this.#tableDefinition.schema}.${this.#tableDefinition.name}`,
    );
  }

  getTableName(): string {
    return this.#tableDefinition.name;
  }

  getSchemaName(): string {
    return this.#tableDefinition.schema;
  }

  getInherits(): string | undefined {
    return this.#tableDefinition.inherits;
  }

  isFinal(): boolean {
    if (this.#tableDefinition.final === undefined) return false;
    return this.#tableDefinition.final;
  }

  getDefinitionClone(): TableDefinitionInternal {
    return {
      ...this.#tableDefinition,
      columns: this.#tableDefinition.columns?.map(
        (column: ColumnDefinitionInternal) => {
          return {
            ...column,
          };
        },
      ),
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

  getOwnColumns(): Column[] {
    const columns: Column[] = [];
    const extendsTableName = this.getInherits();
    if (!extendsTableName) {
      columns.push(
        new Column(
          {
            name: "id",
            type: "uuid",
            not_null: true,
            unique: true,
          },
          this.#registriesHandler,
        ),
        new Column(
          {
            name: "_table",
            type: "string",
            not_null: true,
            unique: false,
          },
          this.#registriesHandler,
        ),
      );
    }
    columns.push(
      ...this.#tableDefinition.columns.map(
        (column: ColumnDefinitionInternal) => {
          return new Column(column, this.#registriesHandler);
        },
      ),
    );
    return columns;
  }

  getColumnSchemas(): ColumnDefinitionHandler[] {
    const allFields: ColumnDefinitionHandler[] = this.getOwnColumns();

    const extendsTableName = this.getInherits();
    if (
      extendsTableName &&
      this.#registriesHandler.tableDefinitionRegistry.has(extendsTableName)
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
    return this.getOwnColumns().map((f) => f.getName());
  }

  getColumnSchema(name: string): ColumnDefinitionHandler | undefined {
    return this.getColumnSchemas().find((field) => field.getName() === name);
  }

  validate() {
    let errorMessages: string[] = [];

    /*
     * Validate table name
     */
    if (
      !this.#tableDefinition.name ||
      typeof this.#tableDefinition.name !== "string"
    ) {
      errorMessages.push(`Invalid table name provided`);
    } else if (!/^[a-z0-9_]+$/i.test(this.#tableDefinition.name)) {
      errorMessages.push(`Table name should be alphanumeric`);
    } else if (
      this.#registriesHandler.tableDefinitionRegistry.has(this.getName())
    ) {
      errorMessages.push(`Table name already exists`);
    }

    /*
     * Validate extends
     */
    const extendsTableName = this.getInherits();
    if (typeof extendsTableName === "string") {
      if (
        !this.#registriesHandler.tableDefinitionRegistry.has(extendsTableName)
      ) {
        errorMessages.push(
          `${this.getName()} cannot extend '${extendsTableName}'. '${this.getInherits()}' does not exists.`,
        );
      } else {
        const extendsCol: TableDefinitionHandler =
          this.#getTableSchema(extendsTableName);
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
    const columnSchemas = this.getOwnColumns();
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
      throw new TableDefinitionError(this.#tableDefinition, errorMessages);
    }
  }

  #getTableSchema(tableName: string): TableDefinitionHandler {
    const schema =
      this.#registriesHandler.tableDefinitionRegistry.get(tableName);
    if (!schema) {
      throw Error(`[Schema::_getSchema] Schema not found :: ${tableName}`);
    }
    return new TableDefinitionHandler(schema, this.#registriesHandler);
  }
}
