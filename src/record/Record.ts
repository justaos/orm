import * as mongodb from 'mongodb';
import Collection from '../collection/Collection';
import Field from '../collection/Field';

export default class Record {
  #isNew = false;

  #record: any;

  readonly #collection: Collection;

  constructor(record: any, collection: Collection) {
    this.#collection = collection;
    if (typeof record !== 'undefined') {
      this.#record = {};
      for (const key of Object.keys(record)) this.set(key, record[key]);
    }
  }

  initialize(): Record {
    this.#record = {};
    this.#collection
      .getSchema()
      .getFields()
      .map((field: Field) => {
        this.set(field.getName(), field.getDefaultValue());
      });
    this.#record['_id'] = new mongodb.ObjectId();
    this.#record['_collection'] = this.#collection.getName();
    this.#isNew = true;
    return this;
  }

  isNew(): boolean {
    return this.#isNew;
  }

  getCollection(): Collection {
    return this.#collection;
  }

  getID(): string {
    return this.get('_id').toString();
  }

  set(key: string, value: any): void {
    const schema = this.#collection.getSchema();
    const field = schema.getField(key);
    if (field)
      this.#record[key] = field
        .getFieldType()
        .setValueIntercept(
          this.#collection.getSchema(),
          key,
          value,
          this.#record
        );
  }

  get(key: string): any {
    const schema = this.#collection.getSchema();
    if (schema.getField(key)) return this.#record[key];
  }

  async getDisplayValue(key: string) {
    const schema = this.#collection.getSchema();
    const field = schema.getField(key);
    return field
      .getFieldType()
      .getDisplayValue(
        schema,
        key,
        this.#record,
        this.#collection.getContext()
      );
  }

  async insert(): Promise<Record> {
    const record = await this.#collection.insertRecord(this);
    this.#record = record.toObject();
    this.#isNew = false;
    return this;
  }

  async update(): Promise<Record> {
    const record = await this.#collection.updateRecord(this);
    this.#record = record.toObject();
    this.#isNew = false;
    return this;
  }

  async delete(): Promise<Record> {
    if (this.#isNew)
      throw Error('[Record::remove] Cannot remove unsaved record');
    await this.#collection.deleteOne(this);
    return this;
  }

  toObject(): any {
    const obj: any = {};
    this.#collection
      .getSchema()
      .getFields()
      .map((field: Field) => {
        obj[field.getName()] = this.get(field.getName());
      });
    return obj;
  }
}
