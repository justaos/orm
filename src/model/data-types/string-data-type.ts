import DataType from "./data-type";

export default class StringDataType implements DataType {

    pattern: any;

    constructor({pattern}: { pattern: any }) {
        this.pattern = pattern;
    }

    transform() {
        return {
            bsonType: "string",
            pattern: this.pattern,
        }
    }


}
