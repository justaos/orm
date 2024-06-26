import type Record from "../record/Record.ts";
import type {
  TRecordInterceptorContext,
  TRecordInterceptorType,
} from "../types.ts";
import type Table from "../table/Table.ts";

abstract class RecordInterceptor {
  #order = 100;

  abstract getName(): string;

  getOrder(): number {
    return this.#order;
  }

  setOrder(order: number): void {
    this.#order = order;
  }

  abstract intercept(
    table: Table,
    operation: TRecordInterceptorType,
    records: Record[],
    context?: TRecordInterceptorContext,
  ): Promise<Record[]>;
}

export default RecordInterceptor;
