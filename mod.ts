import ORM from "./src/ORM.ts";
import ORMConnection from "./src/ORMConnection.ts";
import Record from "./src/record/Record.ts";
import Table from "./src/table/Table.ts";
import { ORMError } from "./src/errors/ORMError.ts";
import DatabaseOperationInterceptor from "./src/operation-interceptor/DatabaseOperationInterceptor.ts";
import SelectQuery from "./src/query/SelectQuery.ts";
import Query from "./src/query/Query.ts";
import TableSchema from "./src/table/TableSchema.ts";
import ColumnSchema from "./src/table/ColumnSchema.ts";
import DataType from "./src/data-types/DataType.ts";
import { RecordSaveError } from "./src/errors/RecordSaveError.ts";
import TableNameUtils from "./src/table/TableNameUtils.ts";
export {
  type JSONArray,
  type JSONObject,
  type JSONPrimitive,
  type JSONValue,
  type UUID4,
} from "./deps.ts";

export {
  ColumnSchema,
  DatabaseOperationInterceptor,
  DataType,
  ORM,
  ORMConnection,
  ORMError,
  Query,
  Record,
  RecordSaveError,
  SelectQuery,
  Table,
  TableNameUtils,
  TableSchema,
};

export type { DatabaseConfiguration } from "./src/core/connection/index.ts";

export type {
  ColumnDefinition,
  ColumnDefinitionRaw,
  DatabaseOperationContext,
  DatabaseOperationType,
  DatabaseOperationWhen,
  NativeDataType,
  RawRecord,
  SimpleCondition,
  TableDefinition,
  TableDefinitionRaw,
} from "./src/types.ts";

export type {
  OrderByDirectionType,
  OrderByType,
} from "./src/table/query/OrderByType.ts";
