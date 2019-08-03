export default class FieldDefinition {

    private readonly type: string;

    private readonly dataType: any;

    private readonly validator: (field: any, fieldDefinition: FieldDefinition) => Boolean;

    private readonly propertiesProvider: (field: any, fieldDefinition: FieldDefinition) => any;

    private readonly properties: any;

    constructor(type: string,
                dataType: any,
                validator: (field: any, fieldDefinition: FieldDefinition) => boolean, propertiesProvider: (field: any, fieldDefinition: FieldDefinition) => any) {
        this.type = type;
        this.dataType = dataType;
        this.validator = validator;
        this.propertiesProvider = propertiesProvider;
    }

    validate(field: any): Boolean {
        return this.validator(field, this);
    }

    getProperties(field: any): any {
        return this.propertiesProvider(field, this);
    }

    getDataType() {
        return this.dataType;
    }

    getType() {
        return this.type
    }
}
