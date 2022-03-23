import DataType from '../dataType.interface';

export default class BooleanDataType extends DataType {
  #type = 'boolean';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return typeof value === 'undefined' || typeof value === 'boolean';
  }

  toJSON(value: any) {
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
