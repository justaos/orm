import DataType from "./dataType.interface";

export default class StringDataType extends DataType {

    config: any;

    constructor(config: any = {}) {
        super();
        this.config = config;
    }

    validate(value: any): void {
        if (value === null) {
            if (this.config.required)
                throw new Error("REQUIRED");
        } else {
            if (typeof value !== 'string')
                throw new Error("NOT_VALID_TYPE");
            if (this.config.pattern && !new RegExp(this.config.pattern).test(value))
                throw new Error("SHOULD_MATCH_PATTERN");
        }
    }

}
