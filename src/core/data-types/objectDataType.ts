import DataType from "./dataType.interface";

export default class ObjectDataType extends DataType {

    config: any;

    constructor(config: any = {}) {
        super();
        this.config = config;
    }

    transform(): any {
        return {
            "type": "object"
        }
    }


}
