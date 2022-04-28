import PrimitiveDataType from './PrimitiveDataType';
import DataType from './DataType';
import AnyDataType from './types/AnyDataType';
import DateDataType from './types/DateDataType';
import StringDataType from './types/StringDataType';
import NumberDataType from './types/NumberDataType';
import BooleanDataType from './types/BooleanDataType';
import ObjectDataType from './types/ObjectDataType';
import ObjectIdDataType from './types/ObjectIdDataType';

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
