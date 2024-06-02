import Registry from "./Registry.ts";
import DataType from "./data-types/DataType.ts";
import { TableDefinitionInternal } from "./types.ts";
import Table from "./table/Table.ts";
import DatabaseOperationInterceptorService from "./operation-interceptor/DatabaseOperationInterceptorService.ts";

export default class RegistriesHandler {
  readonly dataTypeRegistry: Registry<DataType> = new Registry<DataType>(
    function (dataType): string {
      return dataType.getName();
    },
  );
  readonly tableDefinitionRegistry: Registry<TableDefinitionInternal> =
    new Registry<TableDefinitionInternal>(function (tableSchema) {
      return Table.getShortFormTableName(
        `${tableSchema.schema}.${tableSchema.name}`,
      );
    });
  readonly operationInterceptorService: DatabaseOperationInterceptorService =
    new DatabaseOperationInterceptorService();
}
