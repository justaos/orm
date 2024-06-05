import type DatabaseOperationInterceptor from "./DatabaseOperationInterceptor.ts";
import type {
  DatabaseOperationContext,
  DatabaseOperationType,
  DatabaseOperationWhen,
} from "../types.ts";
import type Record from "../record/Record.ts";

export default class DatabaseOperationInterceptorService {
  #interceptors: Map<string, DatabaseOperationInterceptor>;

  constructor() {
    this.#interceptors = new Map<string, DatabaseOperationInterceptor>();
  }

  addInterceptor(operationInterceptor: DatabaseOperationInterceptor): void {
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
    tableName: string,
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[],
    context?: DatabaseOperationContext,
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
            tableName,
            operation,
            when,
            records,
            context,
          );
          if (!records) break;
        }
      }
    }
    return records;
  }

  #getSortedIntercepts(): DatabaseOperationInterceptor[] {
    const intercepts = [];
    for (const interceptor of this.#interceptors.values()) {
      intercepts.push(interceptor);
    }
    return intercepts.sort((a, b) => a.getOrder() - b.getOrder());
  }
}
