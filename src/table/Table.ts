import { Logger } from "../../deps.ts";
import {
  DatabaseOperationContext,
  DatabaseOperationType,
  DatabaseOperationWhen,
  RawRecord
} from "../types.ts";
import Record from "../record/Record.ts";
import TableSchema from "./TableSchema.ts";
import DatabaseOperationInterceptorService from "../operation-interceptor/DatabaseOperationInterceptorService.ts";
import Query from "../query/Query.ts";

export default class Table {
  readonly #schema: TableSchema;
  readonly #context?: DatabaseOperationContext;
  readonly #logger = Logger.createLogger({ label: Table.name });
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
    return this.getTableSchema().getName();
  }

  getTableSchema(): TableSchema {
    return this.#schema;
  }

  getSchemaName(): string {
    return this.getTableSchema().getSchemaName();
  }

  createNewRecord(): Record {
    return new Record(this.#queryBuilder, this, this.#logger).initialize();
  }

  select(...args: any[]): Table {
    this.#queryBuilder = this.#queryBuilder.getInstance();
    this.#queryBuilder.select.apply(this.#queryBuilder, args);
    this.#queryBuilder.from(this.getTableSchema().getFullName());
    return this;
  }

  where(column: any, operator: any, value?: any): Table {
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

  orderBy(column: string, direction: "ASC" | "DESC"): Table {
    this.#queryBuilder.orderBy(column, direction);
    return this;
  }

  async count(): Promise<number> {
    if (!this.#queryBuilder.getType()) {
      this.#queryBuilder = this.#queryBuilder.getInstance();
      this.#queryBuilder.select();
      this.#queryBuilder.from(this.getTableSchema().getFullName());
    }
    if (this.#queryBuilder.getType() !== "select") {
      throw new Error("Count can only be called on select query");
    }
    this.#queryBuilder.count();
    const query = this.#queryBuilder.getSQLQuery();
    this.#logger.info(`[Query] ${query}`);
    const [row] = await this.#queryBuilder.execute();
    return parseInt(row.count, 10);
  }

  async execute(): Promise<any> {
    // deno-lint-ignore no-this-alias
    const table = this;

    const query = this.#queryBuilder.getSQLQuery();
    this.#logger.info(`[Query] ${query}`);

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
    const query = this.#queryBuilder.getSQLQuery();
    this.#logger.info(`[Query] ${query}`);

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

  async getRecordById(id: string): Promise<Record | undefined> {
    this.select();
    this.#queryBuilder.where("id", id);
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
