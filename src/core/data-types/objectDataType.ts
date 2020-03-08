import DataType from "./dataType.interface";

export default class ObjectDataType extends DataType {

    type: string = 'object';

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
            if (typeof value !== 'object')
                throw new Error("NOT_VALID_TYPE");
            if (this.config.class && !(value instanceof this.config.class))
                throw new Error("NOT_VALID_CLASS");
        }
    }


}
