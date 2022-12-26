import Record from "../record/Record.ts";
import { OperationType, OperationWhen } from "../constants.ts";

export default abstract class OperationInterceptorInterface {
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
    operation: OperationType,
    when: OperationWhen,
    records: Record[],
    context: any,
  ): Promise<Record[]>;
}
