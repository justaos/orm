import DataType from "./dataType.interface";

export default class DateDataType extends DataType {

    type: string = 'date';

    config: any;

    constructor(config: any = {}) {
        super();
        this.config = config;
    }

    validate(value: any): void {
        if (value === null) {
            if (this.config.required)
                throw new Error("REQUIRED");
        } else {
            if (!(value instanceof Date))
                throw new Error("NOT_VALID_TYPE");
        }
    }

}
