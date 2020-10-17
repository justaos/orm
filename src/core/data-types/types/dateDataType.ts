import DataType from '../dataType.interface';

export default class DateDataType extends DataType {
  #type = 'date';

  config: any;

  constructor() {
    super();
  }

  validateType(value: any): boolean {
    return value === null || value instanceof Date;
  }

  toJSON(value: any) {
    if (value instanceof Date) return value.toISOString();
    return value;
  }

  getType(): string {
    return this.#type;
  }
}
