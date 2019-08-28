import DataType from "./dataType";

export default class IntegerDataType implements DataType {

    config: any | undefined;

    constructor(config: any = {}) {
        this.config = config;
    }

    transform() {
        return {
            "type": "integer"
        };
    }

    format(value: number) {
        return value;
    }


}
