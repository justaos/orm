import Record from "../record/Record.ts";
import TableSchema from "./TableSchema.ts";
import DatabaseOperationInterceptorService from "../operation-interceptor/DatabaseOperationInterceptorService.ts";
import { Logger } from "../../deps.ts";
import {
  DatabaseOperationType,
  DatabaseOperationWhen,
  OPERATION_TYPES,
  OPERATION_WHENS
} from "../constants.ts";
import SelectQuery from "../query/SelectQuery.ts";
import { RawRecord } from "../record/RawRecord.ts";
import { DatabaseOperationContext } from "../operation-interceptor/DatabaseOperationContext.ts";

export default class Table {
  readonly #sql: any;
  readonly #schema: TableSchema;
  readonly #context?: DatabaseOperationContext;
  readonly #logger = Logger.createLogger({ label: Table.name });
  readonly #operationInterceptorService: DatabaseOperationInterceptorService;

  #disableIntercepts: boolean | string[] = false;

  #selectQuery?: SelectQuery;

  #queryType?: "select" | "update" | "delete" | "insert";

  constructor(
    sql: any,
    schema: TableSchema,
    operationInterceptorService: DatabaseOperationInterceptorService,
    logger: Logger,
    context?: DatabaseOperationContext
  ) {
    this.#sql = sql;
    this.#operationInterceptorService = operationInterceptorService;
    this.#schema = schema;
    this.#logger = logger;
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
    return new Record(this.#sql, this, this.#logger).initialize();
  }

  select(...args: any[]): Table {
    this.#selectQuery = new SelectQuery(this);
    this.#selectQuery.columns(...args);
    return this;
  }

  where(...args: any[]): Table {
    if (!this.#selectQuery) throw new Error("Select query not defined");
    // @ts-ignore
    this.#selectQuery.where.apply(this.#selectQuery, args);
    return this;
  }

  limit(limit: number): Table {
    if (!this.#selectQuery) throw new Error("Select query not defined");
    this.#selectQuery.limit(limit);
    return this;
  }

  offset(offset: number): Table {
    if (!this.#selectQuery) throw new Error("Select query not defined");
    this.#selectQuery.offset(offset);
    return this;
  }

  orderBy(column: string, direction: "ASC" | "DESC"): Table {
    if (!this.#selectQuery) throw new Error("Select query not defined");
    this.#selectQuery.orderBy(column, direction);
    return this;
  }

  async count(): Promise<number> {
    if (!this.#selectQuery) throw new Error("Select query not defined");
    const query = this.#selectQuery.buildCountQuery();
    this.#logger.info(`[Query] ${query}`);
    const reserve = await this.#sql.reserve();
    const [result] = await reserve.unsafe(query);
    reserve.release();
    return parseInt(result.count);
  }

  async runQuery(): Promise<any> {
    if (!this.#selectQuery) throw new Error("Select query not defined");
    const table = this;
    const logger = this.#logger;

    const query = this.#selectQuery.buildSelectQuery();
    this.#logger.info(`[Query] ${query}`);

    await this.intercept(OPERATION_TYPES.READ, OPERATION_WHENS.BEFORE, []);

    const reserve = await this.#sql.reserve();
    const cursor = await reserve.unsafe(query).cursor();
    reserve.release();

    return async function* () {
      for await (const [row] of cursor) {
        const [record] = await table.intercept(
          OPERATION_TYPES.READ,
          OPERATION_WHENS.AFTER,
          [new Record(table.#sql, table, logger, row)]
        );
        yield record;
      }
    };
  }

  async toArray(): Promise<Record[]> {
    if (!this.#selectQuery) throw new Error("Select query not defined");
    const query = this.#selectQuery.buildSelectQuery();
    this.#logger.info(`[Query] ${query}`);

    await this.intercept(OPERATION_TYPES.READ, OPERATION_WHENS.BEFORE, []);

    const reserve = await this.#sql.reserve();
    const rawRecords: RawRecord[] = await reserve.unsafe(query);
    reserve.release();

    const records = this.convertRawRecordsToRecords(rawRecords);
    await this.intercept(OPERATION_TYPES.READ, OPERATION_WHENS.AFTER, records);
    return records;
  }

  convertRawRecordsToRecords(rawRecords: RawRecord[]): Record[] {
    return rawRecords.map((rawRecord) => {
      return new Record(this.#sql, this, this.#logger, rawRecord);
    });
  }

  async findById(id: string): Promise<Record | undefined> {
    this.#selectQuery = new SelectQuery(this);
    this.#selectQuery.where("id", id);
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
      OPERATION_TYPES.CREATE,
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
      OPERATION_TYPES.CREATE,
      OPERATION_WHENS.AFTER,
      savedRecords
    );
    return savedRecords;
  }

  async bulkUpdate(records: Record[]): Promise<Record> {}

  async deleteRecords(records: Record[]): Promise<any> {
    records = await this.intercept(
      OPERATION_TYPES.DELETE,
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
      OPERATION_TYPES.DELETE,
      OPERATION_WHENS.AFTER,
      records
    );
  }*/

  /* aggregate(pipeline: any[]): AggregationCursor {
    const cursor = this.#collection.aggregate(pipeline);
    return new AggregationCursor(cursor, this);
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
