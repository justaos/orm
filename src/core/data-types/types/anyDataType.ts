import DataType from '../dataType.interface';

export default class AnyDataType extends DataType {
  #type = 'any';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return true;
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
