import DataType from '../dataType.interface';
import { ObjectId } from 'mongodb';

export default class ObjectIdDataType extends DataType {
  #type = 'objectId';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return value === null || value instanceof ObjectId;
  }

  toJSON(value: any) {
    if (value instanceof ObjectId) return value.toString();
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
