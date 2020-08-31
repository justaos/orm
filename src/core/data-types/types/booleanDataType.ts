import DataType from "../dataType.interface";

export default class BooleanDataType extends DataType {

    type: string = 'boolean';

    constructor() {
        super();
    }

    validateType(value: any): boolean {
        return (value === null || typeof value === 'boolean');
    }


    toJSON(value: any) {
        return value;
    }

}
