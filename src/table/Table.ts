import { Logger, UUID } from "../../deps.ts";
import { DatabaseOperationContext, DatabaseOperationType, DatabaseOperationWhen, RawRecord } from "../types.ts";
import Record from "../record/Record.ts";
import TableSchema from "./TableSchema.ts";
import DatabaseOperationInterceptorService from "../operation-interceptor/DatabaseOperationInterceptorService.ts";
import Query from "../query/Query.ts";
import { logSQLQuery } from "../utils.ts";
import TableNameUtils from "./TableNameUtils.ts";
import { OrderByDirectionType, OrderByType } from "./query/OrderByType.ts";
import SelectQuery from "../query/SelectQuery.ts";

export default class Table {
  readonly #schema: TableSchema;
  readonly #context?: DatabaseOperationContext;
  readonly #logger: Logger;
  readonly #operationInterceptorService: DatabaseOperationInterceptorService;
  #queryBuilder: Query;

  #disableIntercepts: boolean | string[] = false;

  readonly #sql: any;

  constructor(
    queryBuilder: Query,
    schema: TableSchema,
    operationInterceptorService: DatabaseOperationInterceptorService,
    logger: Logger,
    sql: any,
    context?: DatabaseOperationContext
  ) {
    this.#queryBuilder = queryBuilder;
    this.#operationInterceptorService = operationInterceptorService;
    this.#schema = schema;
    this.#logger = logger;
    this.#sql = sql;
    this.#context = context;
  }

  getContext(): DatabaseOperationContext | undefined {
    return this.#context;
  }

  getName(): string {
    return this.#schema.getName();
  }

  getTableName(): string {
    return this.#schema.getTableName();
  }

  getSchemaName(): string {
    return this.#schema.getSchemaName();
  }

  getTableSchema(): TableSchema {
    return this.#schema;
  }

  getColumnNames(): string[] {
    return this.#schema.getColumnNames();
  }

  createNewRecord(): Record {
    return new Record(this.#queryBuilder, this, this.#logger).initialize();
  }

  select(...args: any[]): Table {
    this.#queryBuilder = this.#queryBuilder.getInstance();
    this.#queryBuilder.select.apply(this.#queryBuilder, args);
    this.#queryBuilder.from(this.getName());
    return this;
  }

  getSelectedColumns() {
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

  orderBy(columnNameOrOrderList?: string | OrderByType[],
          direction?: OrderByDirectionType): Table {
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
      throw new Error("Count can only be called on select query");
    }

    logSQLQuery(this.#logger, this.#queryBuilder.getCountSQLQuery());
    const [row] = await this.#queryBuilder.execute(this.#queryBuilder.getCountSQLQuery());
    return parseInt(row.count, 10);
  }

  async execute(): Promise<any> {
    // deno-lint-ignore no-this-alias
    const table = this;

    logSQLQuery(this.#logger, this.#queryBuilder.getSQLQuery());

    await this.intercept("SELECT", "BEFORE", []);

    const cursor = await this.#queryBuilder.cursor();

    return async function* () {
      for await (const [row] of cursor) {
        const [record] = await table.intercept("SELECT", "AFTER", [
          table.convertRawRecordToRecord(row)
        ]);
        yield record;
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
        this.convertRawRecordToRecord(row)
      ]);
      records.push(record);
    }
    return records;
  }

  convertRawRecordToRecord(rawRecord: RawRecord): Record {
    return new Record(this.#queryBuilder, this, this.#logger, rawRecord);
  }

  /*
    * Get record by id
    * @param idOrColumnNameOrFilter Id or column name or filter
    * @param value Value
    * @returns Record
    *
    * @example
    * const record = await table.getRecord('id', '123');
    * const record = await table.getRecord('123');
    * const record = await table.getRecord({id: '123'});
    * const record = await table.getRecord({id: '123', name: 'test'});
   */
  async getRecord(idOrColumnNameOrFilter: UUID | string | {
    [key: string]: any
  }, value?: any): Promise<Record | undefined> {
    this.select();
    if (typeof idOrColumnNameOrFilter == "string" && typeof value === "undefined") {
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

  async disableAllTriggers() {
    const reserve = await this.#sql.reserve();
    await reserve.unsafe(`ALTER TABLE ${TableNameUtils.getFullFormTableName(this.getName())} DISABLE TRIGGER ALL`);
    await reserve.release();
  }

  async enableAllTriggers() {
    const reserve = await this.#sql.reserve();
    await reserve.unsafe(`ALTER TABLE ${TableNameUtils.getFullFormTableName(this.getName())} ENABLE TRIGGER ALL`);
    await reserve.release();
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
    const reserve = await this.#sql.reserve();
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

    const reserve = await this.#sql.reserve();
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

  async intercept(
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[]
  ): Promise<Record[]> {
    records = await this.#operationInterceptorService.intercept(
      this.getName(),
      operation,
      when,
      records,
      this.#context,
      this.#disableIntercepts
    );
    return records;
  }

  /*
  #formatFilter(filter: any, schema: TableSchema): void {
    Object.keys(filter).forEach((key) => {
      const field = schema.getColumnSchema(key);
      if (field && typeof filter[key] !== "object") {
        filter[key] = field
          .getColumnType()
          .setValueIntercept(this.getSchema(), key, filter[key], filter);
      }
    });
  }*/
}
