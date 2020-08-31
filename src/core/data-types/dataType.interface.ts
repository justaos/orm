export default abstract class DataType {

    abstract validateType(value: any): boolean;

    abstract toJSON(value: any): any;

}
