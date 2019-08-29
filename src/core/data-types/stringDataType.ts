import DataType from "./dataType.interface";

export default class StringDataType implements DataType {

    config: any;

    constructor(config: any = {}) {
        this.config = config;
    }

    transform() {
        return {
            "type": "string",
            "pattern": this.config.pattern
        }
    }

    format(value: string) {
        return value;
    }


}
