import DataType from "../DataType.ts";

export default class ObjectDataType implements DataType {
  validate(value: any): boolean {
    return (
      typeof value === "undefined" ||
      value === null ||
      typeof value === "object"
    );
  }

  toJSON(value: any) {
    return value;
  }
}
