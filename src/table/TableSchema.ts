import { CommonUtils } from "../../deps.ts";
import Registry from "../core/Registry.ts";
import ColumnSchema from "./ColumnSchema.ts";
import DataType from "../field-types/DataType.ts";
import {
  TableSchemaDefinition,
  TableSchemaDefinitionStrict
} from "./definitions/TableSchemaDefinition.ts";
import { ColumnSchemaDefinitionStrict } from "./definitions/ColumnSchemaDefinition.ts";
import TableDefinitionError from "../errors/TableDefinitionError.ts";

export default class TableSchema {
  readonly #definition: TableSchemaDefinitionStrict;

  readonly #fieldTypeRegistry: Registry<DataType>;

  readonly #schemaRegistry: Registry<TableSchemaDefinitionStrict>;

  constructor(
    tableSchemaDefinition: TableSchemaDefinition,
    fieldTypeRegistry: Registry<DataType>,
    schemaRegistry: Registry<TableSchemaDefinitionStrict>
  ) {
    this.#fieldTypeRegistry = fieldTypeRegistry;
    this.#schemaRegistry = schemaRegistry;
    this.#definition = TableSchema.setDefaults(tableSchemaDefinition);
  }

  static setDefaults(
    tableSchemaDefinition: TableSchemaDefinition
  ): TableSchemaDefinitionStrict {
    tableSchemaDefinition = {
      final: false,
      columns: [],
      schema: "public",
      ...tableSchemaDefinition
    };

    if (tableSchemaDefinition.columns) {
      for (let i = 0; i < tableSchemaDefinition.columns.length; i++) {
        tableSchemaDefinition.columns[i] = ColumnSchema.setDefaults(
          tableSchemaDefinition.columns[i]
        );
      }
    }

    return <TableSchemaDefinitionStrict>tableSchemaDefinition;
  }

  getName(): string {
    return this.#definition.name;
  }

  getExtends(): string | undefined {
    return this.#definition.extends;
  }

  isFinal(): boolean {
    if (this.#definition.final === undefined) return false;
    return this.#definition.final;
  }

  getDefinition(): TableSchemaDefinitionStrict {
    return {
      ...this.#definition,
      columns: this.#definition.columns?.map((column: any) => {
        return {
          ...column
        };
      })
    };
  }

  getExtendsStack(): string[] {
    let extendsStack = [this.getName()];
    const extendsTableName = this.getExtends();
    if (extendsTableName) {
      extendsStack = extendsStack.concat(
        this.#getTableSchema(extendsTableName).getExtendsStack()
      );
    }
    return extendsStack;
  }

  getBaseName(): string {
    let hostName = this.getName();
    const extendsTableName = this.getExtends();
    if (extendsTableName) {
      const extendedSchema = this.#getTableSchema(extendsTableName);
      hostName = extendedSchema.getBaseName();
    }
    return hostName;
  }

  getColumnSchemas(): ColumnSchema[] {
    let allFields: ColumnSchema[] = [
      ...this.#definition.columns.map(
        (column: ColumnSchemaDefinitionStrict) => {
          return new ColumnSchema(
            this,
            column,
            this.#fieldTypeRegistry.get(column.type)
          );
        }
      )
    ];

    const extendsTableName = this.getExtends();
    if (extendsTableName) {
      const extendedSchema = this.#getTableSchema(extendsTableName);
      allFields = allFields.concat(extendedSchema.getColumnSchemas());
    } else {
      allFields.push(
        new ColumnSchema(
          this,
          {
            name: "id",
            type: "string",
            not_null: true,
            unique: true
          },
          this.#fieldTypeRegistry.get("string")
        ),
        new ColumnSchema(
          this,
          {
            name: "_table",
            type: "string",
            not_null: true,
            unique: false
          },
          this.#fieldTypeRegistry.get("string")
        )
      );
    }
    return allFields;
  }

  getField(name: string): ColumnSchema | undefined {
    return this.getColumnSchemas().find(
      (field: ColumnSchema) => field.getName() === name
    );
  }

  /* async validateRecord(recordObject: any, context: any) {
    const fieldErrors: any[] = [];
    for (const field of this.getFields()) {
      try {
        await field.validateValue(recordObject, context);
      } catch (err) {
        fieldErrors.push(err);
      }
    }
    if (fieldErrors.length) {
      throw new RecordValidationError(
        {
          ...this.#definition,
          columns: undefined
        },
        recordObject.id,
        fieldErrors
      );
    }
  }*/

  validate() {
    let errorMessages: string[] = [];

    /*
     * Validate table name
     */
    if (!this.getName() || typeof this.getName() !== "string") {
      errorMessages.push(`Invalid table name provided`);
    } else if (!/^[a-z0-9_]+$/i.test(this.getName())) {
      errorMessages.push(`Table name should be alphanumeric`);
    } else if (this.#schemaRegistry.has(this.getName())) {
      errorMessages.push(`Table name already exists`);
    }

    /*
     * Validate extends
     */
    const extendsTableName = this.getExtends();
    if (typeof extendsTableName === "string") {
      if (!this.#schemaRegistry.has(extendsTableName)) {
        errorMessages.push(
          `${this.getName()} cannot extend '${extendsTableName}'. '${this.getExtends()}' does not exists.`
        );
      }
      const extendsCol: TableSchema = this.#getTableSchema(extendsTableName);
      if (extendsCol.isFinal()) {
        errorMessages.push(
          `${this.getName()} cannot extend '${extendsTableName}'. '${this.getExtends()}' is final table schema.`
        );
      }
    }

    /*
     * Validate columns
     */
    const columnSchemas = this.getColumnSchemas();
    for (const columnSchema of columnSchemas) {
      errorMessages = errorMessages.concat(columnSchema.validate());
    }

    const columnNames: string[] = columnSchemas.map((f) => f.getName());
    const duplicates = CommonUtils.findDuplicates(columnNames);
    if (duplicates.length) {
      errorMessages.push(`Duplicate fields -> ${duplicates.join(",")}`);
    }

    if (errorMessages.length) {
      throw new TableDefinitionError(this.#definition, errorMessages);
    }
  }

  #getTableSchema(schemaName: string): TableSchema {
    const schema = this.#schemaRegistry.get(schemaName);
    if (!schema) throw Error("[Schema::_getSchema] Schema not found");
    return new TableSchema(
      schema,
      this.#fieldTypeRegistry,
      this.#schemaRegistry
    );
  }
}
