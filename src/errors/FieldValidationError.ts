export default class FieldValidationError extends Error {

    code: string;

    fieldType: string;

    fieldName: string;

    fieldValue: string

    constructor(fieldName: string, fieldType: string, fieldValue: string, code: string) {
        super();
        this.name = "FieldValidationError";
        this.fieldName = fieldName;
        this.fieldType = fieldType;
        this.fieldValue = fieldValue;
        this.code = code;
        Object.setPrototypeOf(this, FieldValidationError.prototype);
    }

    toJSON() {
        const result:any = {};
        result.code = this.code;
        result.fieldType = this.fieldType;
        result.fieldName = this.fieldName;
        result.fieldValue = this.fieldValue;
        return result;
    }

}