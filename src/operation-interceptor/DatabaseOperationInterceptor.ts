import Record from "../record/Record.ts";
import { DatabaseOperationType, DatabaseOperationWhen } from "../constants.ts";

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
    collectionName: string,
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[],
    context: any
  ): Promise<Record[]>;
}
