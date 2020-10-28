import DataType from '../dataType.interface';

export default class NumberDataType extends DataType {
  #type = 'number';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return value === null || typeof value === 'number';
  }

  toJSON(value: any) {
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
