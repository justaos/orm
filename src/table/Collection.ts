import { mongodb } from "../../deps.ts";

import FindCursor from "./FindCursor.ts";
import Record from "../record/Record.ts";
import TableSchema from "./TableSchema.ts";
import { OperationType, OperationWhen } from "../constants.ts";
import AggregationCursor from "./AggregationCursor.ts";
import DatabaseOperationInterceptorService from "../operation-interceptor/DatabaseOperationInterceptorService.ts";

export default class Collection {
  readonly #collection: mongodb.Collection<any>;
  readonly #schema: TableSchema;
  readonly #context: any;
  readonly #operationInterceptorService: DatabaseOperationInterceptorService;

  #disableIntercepts: boolean | string[] = false;

  constructor(
    collection: mongodb.Collection,
    schema: TableSchema,
    operationInterceptorService: DatabaseOperationInterceptorService,
    context: any
  ) {
    this.#collection = collection;
    this.#operationInterceptorService = operationInterceptorService;
    this.#schema = schema;
    this.#context = context;
  }

  getContext(): any {
    return this.#context;
  }

  getName(): string {
    return this.getSchema().getName();
  }

  getSchema(): TableSchema {
    return this.#schema;
  }

  createNewRecord(): Record {
    return new Record(undefined, this).initialize();
  }

  async findById(id: mongodb.ObjectId | string): Promise<Record | undefined> {
    if (typeof id === "string") id = new mongodb.ObjectId(id);
    return this.findOne({ _id: id }, {});
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

  async findOne(
    filter: any,
    options?: mongodb.FindOptions<any>
  ): Promise<Record | undefined> {
    const schema = this.getSchema();
    if (!filter) filter = {};
    this.#formatFilter(filter, schema);
    if (schema.getExtends()) filter._collection = schema.getName();
    const doc = await this.#collection.findOne(filter, options);
    if (doc) return new Record(doc, this);
  }

  find(filter: any = {}, options?: any): FindCursor {
    const schema = this.getSchema();
    this.#formatFilter(filter, schema);
    if (schema.getExtends()) filter._collection = schema.getName();
    const cursor = this.#collection.find(filter, options);
    return new FindCursor(cursor, this);
  }

  async insertRecord(record: Record): Promise<Record> {
    record = await this.#interceptRecord(
      OperationType.CREATE,
      OperationWhen.BEFORE,
      record
    );
    await this.getSchema().validateRecord(record.toObject(), this.getContext());
    const response = await this.#collection.insertOne(record.toObject());
    const savedDoc = await this.#collection.findOne(
      { _id: response.insertedId },
      {}
    );
    const savedRecord = new Record(savedDoc, this);
    return await this.#interceptRecord(
      OperationType.CREATE,
      OperationWhen.AFTER,
      savedRecord
    );
  }

  async updateRecord(record: Record): Promise<Record> {
    record = await this.#interceptRecord(
      OperationType.UPDATE,
      OperationWhen.BEFORE,
      record
    );
    await this.getSchema().validateRecord(record.toObject(), this.getContext());
    await this.#collection.updateOne(
      { _id: record.get("_id") },
      { $set: { ...record.toObject() } }
    );
    return await this.#interceptRecord(
      OperationType.UPDATE,
      OperationWhen.AFTER,
      record
    );
  }

  async deleteOne(record: Record): Promise<{
    /** Indicates whether this write result was acknowledged. If not, then all other members of this result will be undefined. */
    acknowledged: boolean;
    /** The number of documents that were deleted */
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
  }

  async intercept(
    operation: OperationType,
    when: OperationWhen,
    records: Record[]
  ): Promise<Record[]> {
    return await this.#operationInterceptorService.intercept(
      this.getName(),
      operation,
      when,
      records,
      this.#context,
      this.#disableIntercepts
    );
  }

  async count(filter?: any, options?: any): Promise<number> {
    return this.#collection.countDocuments(filter, options);
  }

  async #interceptRecord(
    operation: OperationType,
    when: OperationWhen,
    record: Record
  ): Promise<Record> {
    const records: Record[] = await this.intercept(operation, when, [record]);
    return records[0];
  }

  #formatFilter(filter: any, schema: TableSchema): void {
    Object.keys(filter).forEach((key) => {
      const field = schema.getField(key);
      if (field && typeof filter[key] !== "object") {
        filter[key] = field
          .getColumnType()
          .setValueIntercept(this.getSchema(), key, filter[key], filter);
      }
    });
  }
}
