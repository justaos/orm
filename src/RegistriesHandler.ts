import Registry from "./Registry.ts";
import DataType from "./data-types/DataType.ts";
import {
  DatabaseOperationContext,
  DatabaseOperationType,
  DatabaseOperationWhen,
  TableDefinitionInternal,
} from "./types.ts";
import Table from "./table/Table.ts";
import DatabaseOperationInterceptorService from "./operation-interceptor/DatabaseOperationInterceptorService.ts";
import DatabaseOperationInterceptor from "./operation-interceptor/DatabaseOperationInterceptor.ts";
import Record from "./record/Record.ts";

export default class RegistriesHandler {
  readonly #tableDefinitionRegistry: Registry<TableDefinitionInternal> =
    new Registry<TableDefinitionInternal>(function (tableDefinition) {
      return Table.getShortFormTableName(
        `${tableDefinition.schema}.${tableDefinition.name}`,
      );
    });
  readonly #dataTypeRegistry: Registry<DataType> = new Registry<DataType>(
    function (dataType): string {
      return dataType.getName();
    },
  );
  readonly #operationInterceptorService: DatabaseOperationInterceptorService =
    new DatabaseOperationInterceptorService();

  addDataType(dataType: DataType): void {
    this.#dataTypeRegistry.add(dataType);
  }

  hasDataType(name: string): boolean {
    return this.#dataTypeRegistry.has(name);
  }

  getDataType(name: string): DataType | undefined {
    return this.#dataTypeRegistry.get(name);
  }

  addTableDefinition(tableDefinition: TableDefinitionInternal): void {
    this.#tableDefinitionRegistry.add(tableDefinition);
  }

  getTableDefinition(tableName: string): TableDefinitionInternal | undefined {
    return this.#tableDefinitionRegistry.get(tableName);
  }

  hasTableDefinition(tableName: string): boolean {
    return this.#tableDefinitionRegistry.has(tableName);
  }

  deleteTableDefinition(tableName: string): void {
    this.#tableDefinitionRegistry.delete(tableName);
  }

  addInterceptor(operationInterceptor: DatabaseOperationInterceptor): void {
    this.#operationInterceptorService.addInterceptor(operationInterceptor);
  }

  deleteInterceptor(name: string): void {
    this.#operationInterceptorService.deleteInterceptor(name);
  }

  async intercept(
    tableName: string,
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[],
    context?: DatabaseOperationContext,
    disabledIntercepts?: boolean | string[],
  ): Promise<Record[]> {
    return await this.#operationInterceptorService.intercept(
      tableName,
      operation,
      when,
      records,
      context,
      disabledIntercepts,
    );
  }
}
