import DataType from "../DataType.ts";

export default class IntegerDataType implements DataType {
  validate(value: any): boolean {
    return (
      typeof value === "undefined" ||
      value === null ||
      (typeof value === "number" && Number.isInteger(value))
    );
  }

  toJSON(value: any) {
    return value;
  }
}
