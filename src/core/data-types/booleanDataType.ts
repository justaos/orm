import DataType from "./dataType.interface";

export default class BooleanDataType extends DataType {

    config: any;

    constructor(config: any = {}) {
        super();
        this.config = config;
    }

    transform() {
        return {
            "type": "boolean"
        }
    }

    format(value: any) {
        if (typeof value === "boolean")
            return value;
        return !!value;
    }

}
