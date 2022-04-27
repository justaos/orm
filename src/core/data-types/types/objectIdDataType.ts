import DataType from '../dataType.interface';
import * as mongodb from 'mongodb';

export default class ObjectIdDataType extends DataType {
  #type = 'objectId';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return (
      typeof value === 'undefined' ||
      value === null ||
      value instanceof mongodb.ObjectId
    );
  }

  toJSON(value: any) {
    if (value instanceof mongodb.ObjectId) return value.toString();
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
