import DataType from '../DataType';

export default class StringDataType implements DataType {
  validate(value: any): boolean {
    return (
      typeof value === 'undefined' ||
      value === null ||
      typeof value === 'string'
    );
  }

  toJSON(value: any) {
    return value;
  }
}
