import DataType from '../DataType';

export default class AnyDataType implements DataType {
  validate(_value: any): boolean {
    return true;
  }

  toJSON(value: any) {
    return value;
  }
}
