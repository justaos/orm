import PrimitiveDataType from './PrimitiveDataType.ts';
import DataType from './DataType.ts';
import AnyDataType from './types/AnyDataType.ts';
import DateDataType from './types/DateDataType.ts';
import StringDataType from './types/StringDataType.ts';
import NumberDataType from './types/NumberDataType.ts';
import BooleanDataType from './types/BooleanDataType.ts';
import ObjectDataType from './types/ObjectDataType.ts';
import ObjectIdDataType from './types/ObjectIdDataType.ts';

export default class DataTypeFactory {
  static getDataType(type: PrimitiveDataType): DataType {
    switch (type) {
      case PrimitiveDataType.DATE:
        return new DateDataType();
      case PrimitiveDataType.ANY:
        return new AnyDataType();
      case PrimitiveDataType.STRING:
        return new StringDataType();
      case PrimitiveDataType.NUMBER:
        return new NumberDataType();
      case PrimitiveDataType.BOOLEAN:
        return new BooleanDataType();
      case PrimitiveDataType.OBJECT:
        return new ObjectDataType();
      case PrimitiveDataType.OBJECT_ID:
        return new ObjectIdDataType();
      default:
        return new AnyDataType();
    }
  }
}
