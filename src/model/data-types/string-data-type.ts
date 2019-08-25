import DataType from "./data-type";

export default class StringDataType implements DataType {

    config: any | undefined;

    constructor(config: any = {}) {
        this.config = config;
    }

    transform() {
        return {
            bsonType: "string",
            pattern: this.config.pattern,
        }
    }


}
