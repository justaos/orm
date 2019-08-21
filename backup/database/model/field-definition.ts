export class FieldDefinition {

    private readonly type: string;

    private readonly validator: (field: any, fieldDefinition: FieldDefinition) => Boolean;

    private readonly propertiesProvider: (field: any, fieldDefinition: FieldDefinition) => any;

    private readonly properties: any;

    constructor(type: string,
                validator: (field: any, fieldDefinition: FieldDefinition) => boolean, propertiesProvider: (field: any, fieldDefinition: FieldDefinition) => any) {
        this.type = type;
        this.validator = validator;
        this.propertiesProvider = propertiesProvider;
    }

    validate(field: any): Boolean {
        return this.validator(field, this);
    }

    getProperties(field: any): any {
        return this.propertiesProvider(field, this);
    }

    getType() {
        return this.type
    }
}
