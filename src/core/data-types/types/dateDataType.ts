import DataType from "../dataType.interface";

export default class DateDataType extends DataType {

    type: string = 'date';

    config: any;

    constructor() {
        super();
    }

    validateType(value: any): boolean {
        return (value === null || value instanceof Date);
    }

    toJSON(value: any) {
        if (value instanceof Date)
            return value.toISOString();
        return value
    }

}
