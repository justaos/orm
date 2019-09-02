import DataType from "./dataType.interface";

export default class IntegerDataType extends DataType {

    config: any;

    constructor(config: any = {}) {
        super();
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
