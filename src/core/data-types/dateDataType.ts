import DataType from "./dataType.interface";

export default class DateDataType implements DataType {

    config: any;

    constructor(config: any = {}) {
        this.config = config;
    }

    transform(): any {
        return {
            "type": "string",
            "format": "date-time"
        }
    }

    format(value: any) {
        if (value instanceof Date)
            return value.toISOString();
        return value;
    }

}
