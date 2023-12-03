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
import SelectQuery from "./query/SelectQuery.ts";
import { RecordValidationError } from "../errors/RecordValidationError.ts";
import { FieldValidationError } from "../errors/FieldValidationError.ts";
import { RawRecord } from "../record/RawRecord.ts";
import { DatabaseOperationContext } from "../operation-interceptor/DatabaseOperationContext.ts";

export default class Table {
  readonly #sql: any;
  readonly #schema: TableSchema;
  readonly #context?: DatabaseOperationContext;
  readonly #logger = Logger.createLogger({ label: Table.name });
  readonly #operationInterceptorService: DatabaseOperationInterceptorService;

  #disableIntercepts: boolean | string[] = false;

  constructor(
    sql: any,
    schema: TableSchema,
    operationInterceptorService: DatabaseOperationInterceptorService,
    context?: DatabaseOperationContext
  ) {
    this.#sql = sql;
    this.#operationInterceptorService = operationInterceptorService;
    this.#schema = schema;
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
    return new Record(undefined, this).initialize();
  }

  select(...args: any[]): SelectQuery {
    const selectQuery = new SelectQuery(this, this.#sql);
    selectQuery.columns(...args);
    return selectQuery;
  }

  async findById(id: string): Promise<Record | undefined> {
    const selectQuery = this.select();
    selectQuery.where("id", id);
    const [record] = await selectQuery.toArray();
    return record;
  }

  convertRawRecordsToRecords(rawRecords: RawRecord[]): Record[] {
    return rawRecords.map((rawRecord) => {
      return new Record(rawRecord, this);
    });
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

  async insertRecords(records: Record[]): Promise<Record[]> {
    const reserve = await this.#sql.reserve();

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
    try {
      const command = reserve`INSERT INTO ${reserve(
        this.getTableSchema().getFullName()
      )} ${reserve(rawRecords)} RETURNING *`;
      savedRawRecords = await command.execute();
    } catch (err) {
      reserve.release();
      this.#logger.error(err);
      throw new RecordValidationError(
        this.getTableSchema().getDefinition(),
        "test",
        [],
        err.message
      );
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

  async validateRecord(
    rawRecord: RawRecord,
    context?: DatabaseOperationContext
  ) {
    const fieldErrors: any[] = [];
    for (const columnSchema of this.getTableSchema().getAllColumnSchemas()) {
      const value = rawRecord[columnSchema.getName()];
      try {
        await columnSchema
          .getColumnType()
          .validateValue(
            this.getTableSchema(),
            columnSchema.getName(),
            rawRecord,
            context
          );
      } catch (err) {
        fieldErrors.push(
          new FieldValidationError(
            columnSchema.getDefinition(),
            value,
            err.message
          )
        );
      }
    }
    if (fieldErrors.length) {
      throw new RecordValidationError(
        this.getTableSchema().getDefinition(),
        rawRecord.id,
        fieldErrors
      );
    }
  }

  async updateRecord(record: Record): Promise<Record> {
    const reserve = await this.#sql.reserve();
    [record] = await this.intercept(
      OPERATION_TYPES.UPDATE,
      OPERATION_WHENS.BEFORE,
      [record]
    );

    await this.validateRecord(record.toJSON(), this.getContext());

    const rawRecord = record.toJSON();

    await this.validateRecord(record.toJSON(), this.getContext());

    let savedRawRecord: RawRecord;
    try {
      const command = reserve`UPDATE ${reserve(
        this.getTableSchema().getFullName()
      )} set ${reserve(rawRecord)}   where id = ${rawRecord.id} RETURNING *`;
      [savedRawRecord] = await command.execute();
    } catch (err) {
      reserve.release();
      this.#logger.error(err);
      throw new RecordValidationError(
        this.getTableSchema().getDefinition(),
        "test",
        [],
        err.message
      );
    } finally {
      reserve.release();
    }
    reserve.release();

    let savedRecord = new Record(savedRawRecord, this);
    [savedRecord] = await this.intercept(
      OPERATION_TYPES.UPDATE,
      OPERATION_WHENS.AFTER,
      [savedRecord]
    );
    return savedRecord;
  }

  /*async deleteOne(record: Record): Promise<{
    /!** Indicates whether this write result was acknowledged. If not, then all other members of this result will be undefined. *!/
    acknowledged: boolean;
    /!** The number of documents that were deleted *!/
    deletedCount: number;
  }> {
    record = await this.#interceptRecord(
      OperationType.DELETE,
      OperationWhen.BEFORE,
      record
    );
    const deletedResult = await this.#collection.deleteOne({
      _id: record.get("_id")
    });
    await this.#interceptRecord(
      OperationType.DELETE,
      OperationWhen.AFTER,
      record
    );
    return deletedResult;
  }

  aggregate(pipeline: any[]): AggregationCursor {
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
