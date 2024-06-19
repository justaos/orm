import type RecordInterceptor from "./RecordInterceptor.ts";
import type {
  TRecordInterceptorContext,
  TRecordInterceptorType,
} from "../types.ts";
import type Record from "../record/Record.ts";
import Table from "../table/Table.ts";

export default class DatabaseOperationInterceptorService {
  #interceptors: Map<string, RecordInterceptor>;

  constructor() {
    this.#interceptors = new Map<string, RecordInterceptor>();
  }

  addInterceptor(operationInterceptor: RecordInterceptor): void {
    this.#interceptors.set(
      operationInterceptor.getName(),
      operationInterceptor,
    );
  }

  deleteInterceptor(name: string): void {
    this.#interceptors.delete(name);
  }

  hasInterceptors(): boolean {
    return this.#interceptors.size !== 0;
  }

  async intercept(
    table: Table,
    operation: TRecordInterceptorType,
    records: Record[],
    context?: TRecordInterceptorContext,
    disabledIntercepts?: boolean | string[],
  ): Promise<Record[]> {
    if (disabledIntercepts === true) {
      return records;
    }
    if (this.hasInterceptors()) {
      for (const interceptor of this.#getSortedIntercepts()) {
        if (
          !disabledIntercepts ||
          !disabledIntercepts.includes(interceptor.getName())
        ) {
          records = await interceptor.intercept(
            table,
            operation,
            records,
            context,
          );
          if (!records) break;
        }
      }
    }
    return records;
  }

  #getSortedIntercepts(): RecordInterceptor[] {
    const intercepts = [];
    for (const interceptor of this.#interceptors.values()) {
      intercepts.push(interceptor);
    }
    return intercepts.sort((a, b) => a.getOrder() - b.getOrder());
  }
}
