import type { Logger, UUID4 } from "../../deps.ts";
import type {
  TRecord,
  TRecordInterceptorContext,
  TRecordInterceptorType,
  TTableDefinition,
} from "../types.ts";
import Record from "../record/Record.ts";
import Query from "../query/Query.ts";
import {
  getFullFormTableName,
  getShortFormTableName,
  logSQLQuery,
} from "../utils.ts";
import TableDefinitionHandler from "./TableDefinitionHandler.ts";
import type RegistriesHandler from "../RegistriesHandler.ts";
import { ORMError } from "../../mod.ts";
import DatabaseConnectionPool from "../core/connection/DatabaseConnectionPool.ts";
import ExpressionBuilder from "../core/query-builder/EXPRESSIONS/ExpressionBuilder.ts";
import {
  TOrderBy,
  TOrderByDirection,
  TWhereClauseOperator,
} from "../core/types.ts";

export default class Table extends TableDefinitionHandler {
  readonly #context?: TRecordInterceptorContext;
  readonly #logger: Logger;
  readonly #registriesHandler: RegistriesHandler;

  #query: Query | null = null;

  #disableIntercepts: boolean | string[] = false;

  readonly #pool: DatabaseConnectionPool;

  constructor(
    pool: DatabaseConnectionPool,
    tableDefinition: TTableDefinition,
    registriesHandler: RegistriesHandler,
    logger: Logger,
    context?: TRecordInterceptorContext,
  ) {
    super(tableDefinition, registriesHandler);
    this.#registriesHandler = registriesHandler;
    this.#logger = logger;
    this.#pool = pool;
    this.#context = context;
  }

  static getFullFormTableName(name: string): string {
    return getFullFormTableName(name);
  }

  static getShortFormTableName(name: string): string {
    return getShortFormTableName(name);
  }

  getContext(): TRecordInterceptorContext | undefined {
    return this.#context;
  }

  createNewRecord(): Record {
    const query = new Query(this.#pool);
    query.select();
    query.from(this.getName());
    return new Record(query, this, this.#logger);
  }

  convertRawRecordToRecord(rawRecord: TRecord): Record {
    const query = new Query(this.#pool);
    query.select();
    query.from(this.getName());
    return new Record(query, this, this.#logger, rawRecord);
  }

  where(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): Table {
    if (!this.#query) {
      this.#query = new Query(this.#pool);
      this.#query.select();
      this.#query.from(this.getName());
    }
    this.#query.where(columnOrCompoundFunction, operatorOrValue, value);
    return this;
  }

  orWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): Table {
    if (!this.#query) {
      this.#query = new Query(this.#pool);
      this.#query.select();
      this.#query.from(this.getName());
    }
    this.#query.orWhere(columnOrCompoundFunction, operatorOrValue, value);
    return this;
  }

  andWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): Table {
    this.#query = new Query(this.#pool);
    this.#query.select();
    this.#query.from(this.getName());
    this.#query.andWhere(columnOrCompoundFunction, operatorOrValue, value);
    return this;
  }

  limit(limit: number): Table {
    if (!this.#query) {
      this.#query = new Query(this.#pool);
      this.#query.select();
      this.#query.from(this.getName());
    }
    this.#query.limit(limit);
    return this;
  }

  offset(offset: number): Table {
    if (!this.#query) {
      this.#query = new Query(this.#pool);
      this.#query.select();
      this.#query.from(this.getName());
    }
    this.#query.offset(offset);
    return this;
  }

  orderBy(
    columnNameOrOrderList?: string | TOrderBy[],
    direction?: TOrderByDirection,
  ): Table {
    if (!this.#query) {
      this.#query = new Query(this.#pool);
      this.#query.select();
      this.#query.from(this.getName());
    }
    this.#query.orderBy(columnNameOrOrderList, direction);
    return this;
  }

  async count(): Promise<number> {
    let query = this.#query;
    if (!query) {
      query = new Query(this.#pool);
      query.select();
      query.from(this.getName());
    }
    this.#query = null;
    const sqlQuery = query.getCountSQLQuery();
    logSQLQuery(this.#logger, sqlQuery);
    const [row] = await query.execute(sqlQuery);
    return parseInt(row.count, 10);
  }

  /**
   * Execute the query and return cursor
   *
   * @example
   * ```typescript
   * const cursor = await table.select().execute();
   * for await (const record of cursor()) {
   *     console.log(record);
   * }
   * ```
   */
  async execute(): Promise<() => AsyncGenerator<Record, void, unknown>> {
    const query = this.#getQuery();

    await this.intercept("BEFORE_SELECT", []);

    logSQLQuery(this.#logger, query.getSQLQuery());

    const { cursor, reserve } = await query.cursor();

    this.#query = null; // Reset query

    reserve.on("error", () => console.log("Error in event."));

    return ((table: Table) => {
      return async function* () {
        try {
          let rows = await cursor.read(1);
          while (rows.length > 0) {
            const [record] = await table.intercept("AFTER_SELECT", [
              table.convertRawRecordToRecord(rows[0]),
            ]);
            yield record;
            rows = await cursor.read(1);
          }
        } finally {
          reserve.release();
        }
      };
    })(this);
  }

  /**
   * Execute the query and return result as array
   *
   * @example
   * ```typescript
   * const records = await table.select().toArray();
   * for (const record of records) {
   *     console.log(record);
   * }
   * ```
   */
  async toArray(): Promise<Record[]> {
    const query = this.#getQuery();

    await this.intercept("BEFORE_SELECT", []);

    logSQLQuery(this.#logger, query.getSQLQuery());

    const rawRecords = await query.execute();

    this.#query = null; // Reset query

    const records: Record[] = [];

    for (const row of rawRecords) {
      const [record] = await this.intercept("AFTER_SELECT", [
        this.convertRawRecordToRecord(row),
      ]);
      records.push(record);
    }
    return records;
  }

  /**
   * Get a record by its ID or a column name and value
   * @param idOrColumnNameOrFilter - The ID of the record or a column name and value
   * @param value - The value of the column
   * @returns The record or undefined if not found
   *
   * @example
   * ```typescript
   * const record = await table.getRecord('id', '123');
   * const record = await table.getRecord('123');
   * const record = await table.getRecord({id: '123'});
   * const record = await table.getRecord({id: '123', name: 'test'});
   * ```
   */
  async getRecord(
    idOrColumnNameOrFilter:
      | UUID4
      | string
      | {
          [key: string]: any;
        },
    value?: any,
  ): Promise<Record | undefined> {
    if (
      typeof idOrColumnNameOrFilter === "undefined" ||
      idOrColumnNameOrFilter === null
    ) {
      throw ORMError.generalError("ID or column name must be provided");
    }
    this.#query = new Query(this.#pool);
    this.#query.select();
    this.#query.from(this.getName());
    if (
      typeof idOrColumnNameOrFilter == "string" &&
      typeof value === "undefined"
    ) {
      this.#query.where("id", idOrColumnNameOrFilter);
    } else if (typeof idOrColumnNameOrFilter == "object") {
      for (const key in idOrColumnNameOrFilter) {
        this.#query.where(key, idOrColumnNameOrFilter[key]);
      }
    } else {
      this.#query.where(idOrColumnNameOrFilter, value);
    }
    this.#query.limit(1);
    const [record] = await this.toArray();
    return record;
  }

  disableIntercepts(): void {
    this.#disableIntercepts = true;
  }

  enableIntercepts(): void {
    this.#disableIntercepts = false;
  }

  disableIntercept(interceptName: string): void {
    if (this.#disableIntercepts === true) return;
    if (this.#disableIntercepts === false) {
      this.#disableIntercepts = [];
    }
    this.#disableIntercepts.push(interceptName);
  }

  /**
   * Disable all triggers on the table
   */
  async disableAllTriggers() {
    const client = await this.#pool.connect();
    await client.runQuery(
      `ALTER TABLE ${Table.getFullFormTableName(
        this.getName(),
      )} DISABLE TRIGGER ALL`,
    );
    client.release();
  }

  /*async bulkInsert(records: Record[]): Promise<Record[]> {
    records = await this.intercept(
      "CREATE",
      OPERATION_WHENS.BEFORE,
      records
    );

    for (const record of records) {
      await this.validateRecord(record.toJSON(), this.getContext());
    }

    const rawRecords = records.map((record) => record.toJSON());

    for (const record of records) {
      await this.validateRecord(record.toJSON(), this.getContext());
    }
    let savedRawRecords: RawRecord;
    const reserve = await this.#pool.reserve();
    try {
      const command = reserve`INSERT INTO ${reserve(
        this.getTableSchema().getFullName()
      )} ${reserve(rawRecords)} RETURNING *`;
      savedRawRecords = await command.execute();
    } catch (err) {
      reserve.release();
      this.#logger.error(err);
      /!* throw new RecordValidationError(
        this.getTableSchema().getDefinition(),
        "test",
        [],
        err.message
      );*!/
    } finally {
      reserve.release();
    }
    reserve.release();

    let savedRecords = savedRawRecords.map((savedRawRecord: RawRecord) => {
      return new Record(savedRawRecord, this);
    });
    savedRecords = await this.intercept(
      "CREATE",
      OPERATION_WHENS.AFTER,
      savedRecords
    );
    return savedRecords;
  }

  async bulkUpdate(records: Record[]): Promise<Record> {}

  async deleteRecords(records: Record[]): Promise<any> {
    records = await this.intercept(
      "DELETE",
      OPERATION_WHENS.BEFORE,
      records
    );

    const ids = records.map((record) => record.getID());

    const reserve = await this.#pool.reserve();
    try {
      const command = reserve`DELETE FROM ${reserve(
        this.getTableSchema().getFullName()
      )} where id in ${ids}`;
      await command.execute();
    } catch (err) {
      reserve.release();
      this.#logger.error(err);
      throw new RecordSaveError(
        this.getTableSchema().getDefinition(),
        "test",
        [],
        err.message
      );
    } finally {
      reserve.release();
    }

    await this.intercept(
      "DELETE",
      OPERATION_WHENS.AFTER,
      records
    );
  }*/

  /**
   * Enable all triggers on the table
   */
  async enableAllTriggers() {
    const client = await this.#pool.connect();
    await client.runQuery(
      `ALTER TABLE ${Table.getFullFormTableName(
        this.getName(),
      )} ENABLE TRIGGER ALL`,
    );
    client.release();
  }

  /**
   * Intercepts table operation
   * @param operation - The operation type
   * @param records - The records
   * @returns The records
   */
  async intercept(
    operation: TRecordInterceptorType,
    records: Record[],
  ): Promise<Record[]> {
    records = await this.#registriesHandler.intercept(
      this,
      operation,
      records,
      this.#context,
      this.#disableIntercepts,
    );
    return records;
  }

  #getQuery() {
    if (!this.#query) {
      throw ORMError.generalError("Query is not initialized");
    }
    return this.#query;
  }
}
