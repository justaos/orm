import DataType from "./dataType.interface";

export default class DateDataType extends DataType {

    config: any;

    constructor(config: any = {}) {
        super();
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
