import FindCursor from '../FindCursor';
import Record from '../record/Record';
import Schema from './Schema';
import * as mongodb from 'mongodb';
import { FindOptions, ObjectId } from 'mongodb';
import { OPERATION_WHEN, OPERATIONS } from '../constants';
import CollectionDefinition from './CollectionDefinition';

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
    return new Record(null, this).initialize();
  }

  async findById(id: ObjectId | string): Promise<Record | null> {
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
  ): Promise<Record | null> {
    const schema = this.getSchema();
    if (!filter) filter = {};
    this.#formatFilter(filter, schema);
    if (schema.getExtends()) filter._collection = schema.getName();
    const doc = await this.#getMongoCollection().findOne(filter, options);
    if (doc) return new Record(doc, this);
    return null;
  }

  find(filter: any = {}, options?: any): FindCursor {
    const schema = this.getSchema();
    this.#formatFilter(filter, schema);
    if (schema.getExtends()) filter._collection = schema.getName();
    const cursor = this.#getMongoCollection().find(filter, options);
    return new FindCursor(cursor, this);
  }

  async insertRecord(record: Record): Promise<Record> {
    record = await this.#interceptRecord(
      OPERATIONS.CREATE,
      OPERATION_WHEN.BEFORE,
      record
    );
    await this.getSchema().validateRecord(record.toObject(), this.getContext());
    const response = await this.#getMongoCollection().insertOne(
      record.toObject()
    );
    const savedDoc = await this.#getMongoCollection().findOne(
      { _id: response.insertedId },
      {}
    );
    const savedRecord = new Record(savedDoc, this);
    return await this.#interceptRecord(
      OPERATIONS.CREATE,
      OPERATION_WHEN.AFTER,
      savedRecord
    );
  }

  async updateRecord(record: Record): Promise<Record> {
    record = await this.#interceptRecord(
      OPERATIONS.UPDATE,
      OPERATION_WHEN.BEFORE,
      record
    );
    await this.getSchema().validateRecord(record.toObject(), this.getContext());
    await this.#getMongoCollection().updateOne(
      { _id: record.get('_id') },
      { $set: { ...record.toObject() } }
    );
    return await this.#interceptRecord(
      OPERATIONS.UPDATE,
      OPERATION_WHEN.AFTER,
      record
    );
  }

  async deleteOne(record: Record): Promise<any> {
    record = await this.#interceptRecord(
      OPERATIONS.DELETE,
      OPERATION_WHEN.BEFORE,
      record
    );
    await this.#getMongoCollection().deleteOne({ _id: record.get('_id') });
    await this.#interceptRecord(OPERATIONS.DELETE, 'after', record);
  }

  async intercept(operation: string, when: string, payload: any) {
    return await this.#intercept(operation, when, payload);
  }

  async count(filter?: any, options?: any) {
    return this.#getMongoCollection().count(filter, options);
  }

  #getMongoCollection(): mongodb.Collection {
    return this.#collectionDefinition.getCollection();
  }

  async #interceptRecord(
    operation: string,
    when: string,
    record: Record
  ): Promise<Record> {
    const updatedPayload = await this.#intercept(operation, when, {
      records: [record]
    });
    return updatedPayload.records[0];
  }

  async #intercept(
    operation: string,
    when: string,
    payload: any
  ): Promise<any> {
    const operationInterceptorService =
      this.#collectionDefinition.getOperationInterceptorService();
    return await operationInterceptorService.intercept(
      this.getName(),
      operation,
      when,
      payload,
      this.#context,
      this.#inactiveIntercepts
    );
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
