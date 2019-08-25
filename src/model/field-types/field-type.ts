import DataType from "../data-types/data-type";

export default abstract class FieldType {

    abstract transform(): DataType;

    abstract getType(): string;

}
