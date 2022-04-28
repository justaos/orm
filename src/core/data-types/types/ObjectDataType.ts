import DataType from '../DataType';

export default class ObjectDataType implements DataType {
  validate(value: any): boolean {
    return (
      typeof value === 'undefined' ||
      value === null ||
      typeof value === 'object'
    );
  }

  toJSON(value: any) {
    return value;
  }
}
