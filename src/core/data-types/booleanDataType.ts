import DataType from "./dataType.interface";

export default class BooleanDataType extends DataType {

    type: string = 'boolean';

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
            if (typeof value !== 'boolean')
                throw new Error("NOT_VALID_TYPE");
        }
    }
}
