import ODM from "./src/ODM.ts";
import ODMConnection from "./src/ODMConnection.ts";
import Record from "./src/record/Record.ts";
import Table from "./src/table/Table.ts";
import { ODMError } from "./src/errors/ODMError.ts";
import DatabaseOperationInterceptor from "./src/operation-interceptor/DatabaseOperationInterceptor.ts";
import SelectQuery from "./src/query/SelectQuery.ts";
import TableSchema from "./src/table/TableSchema.ts";
import ColumnSchema from "./src/table/ColumnSchema.ts";
import DataType from "./src/data-types/DataType.ts";
import { RecordSaveError } from "./src/errors/RecordSaveError.ts";

export {
  ODM,
  ODMConnection,
  Record,
  Table,
  ODMError,
  DatabaseOperationInterceptor,
  SelectQuery,
  TableSchema,
  ColumnSchema,
  DataType,
  RecordSaveError
};

export type { DatabaseConfiguration } from "./src/core/connection/index.ts";
export type {
  UUID,
  DatabaseOperationType,
  DatabaseOperationWhen,
  TableDefinitionRaw,
  TableDefinition,
  ColumnDefinitionRaw,
  ColumnDefinition,
  NativeDataType,
  DatabaseOperationContext,
  RawRecord
} from "./src/types.ts";
export type {
  OrderByType,
  OrderByDirectionType
} from "./src/table/query/OrderByType.ts";
