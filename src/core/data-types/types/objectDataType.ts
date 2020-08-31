import DataType from "../dataType.interface";

export default class ObjectDataType extends DataType {

    type: string = 'object';

    constructor() {
        super();
    }

    validateType(value: any): boolean {
        return (value === null || typeof value === 'object');
    }

    toJSON(value: any) {
        return value;
    }

}
