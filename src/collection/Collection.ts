import FindCursor from './FindCursor';
import Record from '../record/Record';
import Schema from './Schema';
import { FindOptions, ObjectId } from 'mongodb';
import { OperationType, OperationWhen } from '../constants';
import CollectionDefinition from './CollectionDefinition';
import AggregationCursor from './AggregationCursor';

export default class Collection {
  #collectionDefinition: CollectionDefinition;
  #context: any;
  #inactiveIntercepts: string[] = [];

  constructor(collectionDefinition: CollectionDefinition, context?: any) {
    this.#collectionDefinition = collectionDefinition;
    this.#context = context;
  }

  getContext(): any {
    return this.#context;
  }

  getName(): string {
    return this.getSchema().getName();
  }

  getSchema(): Schema {
    return this.#collectionDefinition.getSchema();
  }

  createNewRecord(): Record {
    return new Record(undefined, this).initialize();
  }

  async findById(id: ObjectId | string): Promise<Record | undefined> {
    if (typeof id === 'string') id = new ObjectId(id);
    return this.findOne({ _id: id }, {});
  }

  deactivateIntercept(interceptName: string): void {
    this.#inactiveIntercepts.push(interceptName);
  }

  getInActivateIntercepts(): string[] {
    return this.#inactiveIntercepts;
  }

  clearInActivateIntercepts(): void {
    this.#inactiveIntercepts = [];
  }

  async findOne(
    filter: any,
    options?: FindOptions<any>
  ): Promise<Record | undefined> {
    const schema = this.getSchema();
    if (!filter) filter = {};
    this.#formatFilter(filter, schema);
    if (schema.getExtends()) filter._collection = schema.getName();
    const doc = await this.#collectionDefinition
      .getCollection()
      .findOne(filter, options);
    if (doc) return new Record(doc, this);
  }

  find(filter: any = {}, options?: any): FindCursor {
    const schema = this.getSchema();
    this.#formatFilter(filter, schema);
    if (schema.getExtends()) filter._collection = schema.getName();
    const cursor = this.#collectionDefinition
      .getCollection()
      .find(filter, options);
    return new FindCursor(cursor, this);
  }

  async insertRecord(record: Record): Promise<Record> {
    record = await this.#interceptRecord(
      OperationType.CREATE,
      OperationWhen.BEFORE,
      record
    );
    await this.getSchema().validateRecord(record.toObject(), this.getContext());
    const response = await this.#collectionDefinition
      .getCollection()
      .insertOne(record.toObject());
    const savedDoc = await this.#collectionDefinition
      .getCollection()
      .findOne({ _id: response.insertedId }, {});
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
    await this.#collectionDefinition
      .getCollection()
      .updateOne(
        { _id: record.get('_id') },
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
    const deletedResult = await this.#collectionDefinition
      .getCollection()
      .deleteOne({
        _id: record.get('_id')
      });
    await this.#interceptRecord(
      OperationType.DELETE,
      OperationWhen.AFTER,
      record
    );
    return deletedResult;
  }

  aggregate(pipeline: any[]): AggregationCursor {
    const cursor = this.#collectionDefinition
      .getCollection()
      .aggregate(pipeline);
    return new AggregationCursor(cursor, this);
  }

  async intercept(
    operation: OperationType,
    when: OperationWhen,
    records: Record[]
  ): Promise<Record[]> {
    const operationInterceptorService =
      this.#collectionDefinition.getOperationInterceptorService();
    return await operationInterceptorService.intercept(
      this.getName(),
      operation,
      when,
      records,
      this.#context,
      this.#inactiveIntercepts
    );
  }

  async countDocuments(filter?: any, options?: any): Promise<number> {
    return this.#collectionDefinition
      .getCollection()
      .countDocuments(filter, options);
  }

  async #interceptRecord(
    operation: OperationType,
    when: OperationWhen,
    record: Record
  ): Promise<Record> {
    const records: Record[] = await this.intercept(operation, when, [record]);
    return records[0];
  }

  #formatFilter(filter: any, schema: Schema): void {
    Object.keys(filter).forEach((key) => {
      const field = schema.getField(key);
      if (field && typeof filter[key] !== 'object')
        filter[key] = field
          .getFieldType()
          .setValueIntercept(schema, field, filter[key], filter, this.#context);
    });
  }
}
