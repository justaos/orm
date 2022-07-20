import { mongodb } from '../../../../deps.ts';

import DataType from '../DataType.ts';

export default class ObjectIdDataType implements DataType {
  validate(value: any): boolean {
    return (
      typeof value === 'undefined' ||
      value === null ||
      value instanceof mongodb.ObjectId
    );
  }

  toJSON(value: any): string | null {
    if (value instanceof mongodb.ObjectId) return value.toString();
    return value;
  }
}
