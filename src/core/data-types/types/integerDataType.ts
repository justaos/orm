import DataType from "../dataType.interface";

export default class IntegerDataType extends DataType {

    type: string = 'integer';

    constructor() {
        super();
    }

    validateType(value: any): boolean {
        return (value === null || (typeof value === 'number' && Number.isInteger(value)));
    }

    toJSON(value: any) {
        return value;
    }

}
