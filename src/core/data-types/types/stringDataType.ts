import DataType from '../dataType.interface';

export default class StringDataType extends DataType {
  #type = 'string';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return value === null || typeof value === 'string';
  }

  toJSON(value: any) {
    return value;
  }

  parse(value: any) {
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
