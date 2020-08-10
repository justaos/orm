export default abstract class DataType {

    abstract validate(value: any): void;

    abstract toJSON(value: any): any;

    abstract parse(value: any): any;
}
