import DataType from "./data-type";

export default class IntegerDataType implements DataType {

    config: any | undefined;

    constructor(config: any = {}) {
        this.config = config;
    }

    transform() {
        return {
            bsonType: "int"
        }
    }


}
