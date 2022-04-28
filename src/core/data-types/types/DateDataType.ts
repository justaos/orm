import DataType from '../DataType';

export default class DateDataType implements DataType {
  validate(value: any): boolean {
    return (
      typeof value === 'undefined' || value === null || value instanceof Date
    );
  }

  toJSON(value: any) {
    if (value instanceof Date) return value.toISOString();
    return value;
  }
}
