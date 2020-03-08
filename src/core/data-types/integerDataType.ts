import DataType from "./dataType.interface";

export default class IntegerDataType extends DataType {

    type: string = 'integer';

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
            if (typeof value !== 'number' || !Number.isInteger(value))
                throw new Error("NOT_VALID_TYPE");
        }
    }


}
