import type { Logger, pg, UUID4 } from "../../deps.ts";
import type {
  DatabaseOperationContext,
  DatabaseOperationType,
  DatabaseOperationWhen,
  OrderByDirectionType,
  OrderByType,
  RawRecord,
  TableDefinition,
} from "../types.ts";
import Record from "../record/Record.ts";
import type Query from "../query/Query.ts";
import {
  getFullFormTableName,
  getShortFormTableName,
  logSQLQuery,
} from "../utils.ts";
import TableDefinitionHandler from "./TableDefinitionHandler.ts";
import type RegistriesHandler from "../RegistriesHandler.ts";
import { ORMGeneralError } from "../errors/ORMGeneralError.ts";

export default class Table extends TableDefinitionHandler {
  readonly #context?: DatabaseOperationContext;
  readonly #logger: Logger;
  readonly #registriesHandler: RegistriesHandler;
  #queryBuilder: Query;

  #disableIntercepts: boolean | string[] = false;

  readonly #pool: pg.Pool;

  constructor(
    queryBuilder: Query,
    tableDefinition: TableDefinition,
    registriesHandler: RegistriesHandler,
    logger: Logger,
    pool: pg.Pool,
    context?: DatabaseOperationContext,
  ) {
    super(tableDefinition, registriesHandler);
    this.#registriesHandler = registriesHandler;
    this.#queryBuilder = queryBuilder;
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

  getContext(): DatabaseOperationContext | undefined {
    return this.#context;
  }

  createNewRecord(): Record {
    return new Record(this.#queryBuilder, this, this.#logger).initialize();
  }

  select(): Table {
    this.#queryBuilder = this.#queryBuilder.getInstance();
    this.#queryBuilder.select.apply(this.#queryBuilder);
    this.#queryBuilder.from(this.getName());
    return this;
  }

  getSelectedColumns(): string[] {
    return this.#queryBuilder.getSelectedColumns();
  }

  where(column: string | number | boolean, operator: any, value?: any): Table {
    this.#queryBuilder.where(column, operator, value);
    return this;
  }

  limit(limit: number): Table {
    this.#queryBuilder.limit(limit);
    return this;
  }

  offset(offset: number): Table {
    this.#queryBuilder.offset(offset);
    return this;
  }

  orderBy(
    columnNameOrOrderList?: string | OrderByType[],
    direction?: OrderByDirectionType,
  ): Table {
    this.#queryBuilder.orderBy(columnNameOrOrderList, direction);
    return this;
  }

  async count(): Promise<number> {
    if (!this.#queryBuilder.getType()) {
      this.#queryBuilder = this.#queryBuilder.getInstance();
      this.#queryBuilder.select();
      this.#queryBuilder.from(this.getName());
    }
    if (this.#queryBuilder.getType() !== "select") {
      throw new ORMGeneralError("Count can only be called on select query");
    }

    logSQLQuery(this.#logger, this.#queryBuilder.getCountSQLQuery());
    const [row] = await this.#queryBuilder.execute(
      this.#queryBuilder.getCountSQLQuery(),
    );
    return parseInt(row.count, 10);
  }

  async execute() {
    // deno-lint-ignore no-this-alias
    const table = this;

    logSQLQuery(this.#logger, this.#queryBuilder.getSQLQuery());

    await this.intercept("SELECT", "BEFORE", []);

    const { cursor, reserve } = await this.#queryBuilder.cursor();

    reserve.on("error", () => console.log("Error in event."));

    return async function* () {
      try {
        let rows = await cursor.read(1);
        while (rows.length > 0) {
          const [record] = await table.intercept("SELECT", "AFTER", [
            table.convertRawRecordToRecord(rows[0]),
          ]);
          yield record;
          rows = await cursor.read(1);
        }
      } finally {
        reserve.release();
      }
    };
  }

  async toArray(): Promise<Record[]> {
    logSQLQuery(this.#logger, this.#queryBuilder.getSQLQuery());

    await this.intercept("SELECT", "BEFORE", []);

    const rawRecords = await this.#queryBuilder.execute();

    const records: Record[] = [];

    for (const row of rawRecords) {
      const [record] = await this.intercept("SELECT", "AFTER", [
        this.convertRawRecordToRecord(row),
      ]);
      records.push(record);
    }
    return records;
  }

  convertRawRecordToRecord(rawRecord: RawRecord): Record {
    return new Record(this.#queryBuilder, this, this.#logger, rawRecord);
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
    this.select();
    if (
      typeof idOrColumnNameOrFilter == "string" &&
      typeof value === "undefined"
    ) {
      this.#queryBuilder.where("id", idOrColumnNameOrFilter);
    } else if (typeof idOrColumnNameOrFilter == "object") {
      Object.keys(idOrColumnNameOrFilter).forEach((key) => {
        this.#queryBuilder.where(key, idOrColumnNameOrFilter[key]);
      });
    } else {
      this.#queryBuilder.where(idOrColumnNameOrFilter, value);
    }
    this.#queryBuilder.limit(1);
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
   * Disable all triggers on the table
   */
  async disableAllTriggers() {
    const client = await this.#pool.connect();
    await client.query({
      text: `ALTER TABLE ${Table.getFullFormTableName(
        this.getName(),
      )} DISABLE TRIGGER ALL`,
    });
    client.release();
  }

  /**
   * Enable all triggers on the table
   */
  async enableAllTriggers() {
    const client = await this.#pool.connect();
    await client.query(
      `ALTER TABLE ${Table.getFullFormTableName(
        this.getName(),
      )} ENABLE TRIGGER ALL`,
    );
    client.release();
  }

  /**
   * Intercepts table operation
   * @param operation - The operation type
   * @param when - The operation when
   * @param records - The records
   * @returns The records
   */
  async intercept(
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[],
  ): Promise<Record[]> {
    records = await this.#registriesHandler.intercept(
      this.getName(),
      operation,
      when,
      records,
      this.#context,
      this.#disableIntercepts,
    );
    return records;
  }
}
