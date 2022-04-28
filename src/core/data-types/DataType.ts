export default interface DataType {
  validate(value: any): boolean;

  toJSON(value: any): any;
}
