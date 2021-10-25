import Collection from '../collection/Collection';
import Field from '../collection/Field';

export default class Record {
  #isNew = false;

  #record: any;

  #collection: Collection;

  constructor(record: any, collection: Collection) {
    this.#collection = collection;
    if (record) {
      this.#record = {};
      for (const key of Object.keys(record)) this.set(key, record[key]);
    }
  }

  initialize() {
    this.#record = {};
    this.#collection
      .getSchema()
      .getFields()
      .map((field: Field) => {
        this.set(field.getName(), field.getDefaultValue());
      });
    this.#record['_collection'] = this.#collection.getName();
    this.#isNew = true;
    return this;
  }

  getID(): string | null {
    let id = this.get('_id');
    if (id !== null) id = this.#record._id.toString();
    return id;
  }

  set(key: string, value: any): void {
    const schema = this.#collection.getSchema();
    const field = schema.getField(key);
    if (field)
      this.#record[key] = field
        .getFieldType()
        .setValueIntercept(
          schema,
          field,
          value,
          this.#record,
          this.#collection.getContext()
        );
  }

  get(key: string): any {
    const schema = this.#collection.getSchema();
    if (schema.getField(key))
      return typeof this.#record[key] !== 'undefined'
        ? this.#record[key]
        : null;
    return; // no field exists with key
  }

  async getDisplayValue(key: string) {
    const schema = this.#collection.getSchema();
    const field = schema.getField(key);
    return field
      ?.getFieldType()
      .getDisplayValue(
        schema,
        field,
        this.#record,
        this.#collection.getContext()
      );
  }

  async insert() {
    const record = await this.#collection.insertRecord(this);
    this.#record = record.toObject();
    this.#isNew = false;
    return this;
  }

  async update() {
    const record = await this.#collection.updateRecord(this);
    this.#record = record.toObject();
    this.#isNew = false;
    return this;
  }

  async delete() {
    if (this.#isNew)
      throw Error('[Record::remove] Cannot remove unsaved record');
    await this.#collection.deleteOne(this);
    return this;
  }

  toObject() {
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
