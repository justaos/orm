import DataType from '../DataType.ts';

export default class AnyDataType implements DataType {
  validate(_value: any): boolean {
    return true;
  }

  toJSON(value: any) {
    return value;
  }
}
