import Record from "../record/Record.ts";
import { DatabaseOperationContext, DatabaseOperationType, DatabaseOperationWhen } from "../types.ts";

export default abstract class DatabaseOperationInterceptor {
  #order = 100;

  abstract getName(): string;

  getOrder(): number {
    return this.#order;
  }

  setOrder(order: number): void {
    this.#order = order;
  }

  abstract intercept(
    tableName: string,
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[],
    context?: DatabaseOperationContext
  ): Promise<Record[]>;
}
