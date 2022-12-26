import DataType from "../DataType.ts";

export default class NumberDataType implements DataType {
  validate(value: any): boolean {
    return (
      typeof value === "undefined" ||
      value === null ||
      typeof value === "number"
    );
  }

  toJSON(value: any) {
    return value;
  }
}
