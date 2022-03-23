import DataType from '../dataType.interface';

export default class DateDataType extends DataType {
  config: any;
  #type = 'date';

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return typeof value === 'undefined' || value instanceof Date;
  }

  toJSON(value: any) {
    if (value instanceof Date) return value.toISOString();
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
