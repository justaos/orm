import DataType from '../dataType.interface';

export default class ObjectDataType extends DataType {
  #type = 'object';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return value === null || typeof value === 'object';
  }

  toJSON(value: any) {
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
