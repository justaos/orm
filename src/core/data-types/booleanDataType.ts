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

}
