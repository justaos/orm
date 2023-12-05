import ODM from "./src/ODM.ts";
import ODMConnection from "./src/ODMConnection.ts";
import Record from "./src/record/Record.ts";
import Table from "./src/table/Table.ts";
import { ODMError } from "./src/errors/ODMError.ts";
import { OPERATION_TYPES, OPERATION_WHENS } from "./src/constants.ts";
import DatabaseOperationInterceptor from "./src/operation-interceptor/DatabaseOperationInterceptor.ts";
import SelectQuery from "./src/table/query/SelectQuery.ts";
import TableSchema from "./src/table/TableSchema.ts";
import ColumnSchema from "./src/table/ColumnSchema.ts";
import { NATIVE_DATA_TYPES } from "./src/core/NativeDataType.ts";
import DataType from "./src/data-types/DataType.ts";

export {
  ODM,
  ODMConnection,
  Record,
  Table,
  ODMError,
  OPERATION_TYPES,
  OPERATION_WHENS,
  NATIVE_DATA_TYPES,
  DatabaseOperationInterceptor,
  SelectQuery,
  TableSchema,
  ColumnSchema,
  DataType
};

export type { DatabaseConfiguration } from "./src/core/connection/index.ts";
export type { NativeDataType } from "./src/core/NativeDataType.ts";
export type { UUID } from "./src/core/UUID.ts";
export type { TableDefinitionRaw } from "./src/table/definitions/TableDefinition.ts";
export type { ColumnDefinitionRaw } from "./src/table/definitions/ColumnDefinition.ts";
export type {
  DatabaseOperationType,
  DatabaseOperationWhen
} from "./src/constants.ts";
export type { DatabaseOperationContext } from "./src/operation-interceptor/DatabaseOperationContext.ts";
export type { RawRecord } from "./src/record/RawRecord.ts";
export type {
  OrderByType,
  OrderByDirectionType
} from "./src/table/query/OrderByType.ts";
