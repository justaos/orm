export default abstract class DataType {
  abstract getType(): string;

  abstract validateType(value: any): boolean;

  abstract toJSON(value: any): any;
}
