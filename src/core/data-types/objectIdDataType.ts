import DataType from "./dataType.interface";
import {ObjectId} from "mongodb";

export default class ObjectIdDataType extends DataType {

    type: string = 'objectId';

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
            if (!(value instanceof ObjectId))
                throw new Error("NOT_VALID_TYPE");
        }
    }


}
