import DataType from "./data-type";

export default class DateDataType implements DataType {

    config: any | undefined;

    constructor(config: any = {}) {
        this.config = config;
    }

    transform() {
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
