import DataType from '../dataType.interface';

export default class IntegerDataType extends DataType {
  #type = 'integer';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return (
      typeof value === 'undefined' ||
      value === null ||
      (typeof value === 'number' && Number.isInteger(value))
    );
  }

  toJSON(value: any) {
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
