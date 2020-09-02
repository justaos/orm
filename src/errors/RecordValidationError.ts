import FieldValidationError from "./FieldValidationError";

export default class RecordValidationError extends Error {

    collectionName: string;

    recordId: string | undefined;

    fieldErrors: any[] = [];

    constructor(collectionName: string, recordId:  string | undefined, fieldErrors: any[]) {
        super();
        this.name = "RecordValidationError";
        this.collectionName = collectionName;
        this.recordId = recordId;
        this.fieldErrors = fieldErrors;
        Object.setPrototypeOf(this, RecordValidationError.prototype);
    }

    toJSON() {
        const result:any = {};
        result.collectionName = this.collectionName;
        result.recordId = this.recordId;
        result.fieldErrors = this.fieldErrors.map(function(fieldError: FieldValidationError) {
            return fieldError.toJSON();
        });
        return result;
    }

}