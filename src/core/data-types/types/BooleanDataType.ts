import DataType from '../DataType';

export default class BooleanDataType implements DataType {
  validate(value: any): boolean {
    return (
      typeof value === 'undefined' ||
      value === null ||
      typeof value === 'boolean'
    );
  }

  toJSON(value: any) {
    return value;
  }
}
