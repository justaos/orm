export default abstract class DataType {

    abstract transform(): any;

    format(value: any): any {
        return value;
    }

}
