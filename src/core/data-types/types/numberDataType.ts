import DataType from '../dataType.interface';

export default class NumberDataType extends DataType {
  #type = 'number';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return typeof value === 'undefined' || typeof value === 'number';
  }

  toJSON(value: any) {
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
