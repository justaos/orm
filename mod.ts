import ORM from "./src/ORM.ts";
import ORMConnection from "./src/ORMConnection.ts";
import Record from "./src/record/Record.ts";
import Table from "./src/table/Table.ts";
import Column from "./src/table/Column.ts";

import DatabaseOperationInterceptor from "./src/operation-interceptor/DatabaseOperationInterceptor.ts";
import SelectQuery from "./src/query/SelectQuery.ts";
import Query from "./src/query/Query.ts";
import DataType from "./src/data-types/DataType.ts";
import ORMError from "./src/errors/ORMError.ts";

export {
  Column,
  DatabaseOperationInterceptor,
  DataType,
  ORM,
  ORMConnection,
  ORMError,
  Query,
  Record,
  SelectQuery,
  Table,
};

export { RecordSaveError } from "./src/errors/RecordSaveError.ts";
export { CompoundQuery } from "./src/query/CompoundQuery.ts";

export type {
  JSONArray,
  JSONObject,
  JSONPrimitive,
  JSONValue,
  UUID4,
} from "./deps.ts";

export type { TDatabaseConfiguration } from "./src/core/types.ts";

export type {
  ColumnDefinition,
  DatabaseOperationContext,
  DatabaseOperationType,
  DatabaseOperationWhen,
  NativeDataType,
  OrderByDirectionType,
  OrderByType,
  SimpleCondition,
  TableDefinition,
  TRecord,
} from "./src/types.ts";
