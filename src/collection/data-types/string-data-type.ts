import DataType from "./data-type";

export default class StringDataType implements DataType {

    config: any | undefined;

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
