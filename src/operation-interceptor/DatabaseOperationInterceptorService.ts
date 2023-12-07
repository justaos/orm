import DatabaseOperationInterceptor from "./DatabaseOperationInterceptor.ts";
import { DatabaseOperationType, DatabaseOperationWhen } from "../constants.ts";
import Record from "../record/Record.ts";

export default class DatabaseOperationInterceptorService {
  #interceptors: Map<string, DatabaseOperationInterceptor>;

  constructor() {
    this.#interceptors = new Map<string, DatabaseOperationInterceptor>();
  }

  addInterceptor = (operationInterceptor: DatabaseOperationInterceptor) =>
    this.#interceptors.set(
      operationInterceptor.getName(),
      operationInterceptor
    );

  deleteInterceptor = (name: string) => this.#interceptors.delete(name);

  getInterceptor = (name: string): DatabaseOperationInterceptor | undefined =>
    this.#interceptors.get(name);

  hasInterceptors(): boolean {
    return this.#interceptors.size !== 0;
  }

  #getSortedIntercepts(): DatabaseOperationInterceptor[] {
    const intercepts = [];
    for (const interceptor of this.#interceptors.values()) {
      intercepts.push(interceptor);
    }
    return intercepts.sort((a, b) => a.getOrder() - b.getOrder());
  }

  async intercept(
    tableName: string,
    operation: DatabaseOperationType,
    when: DatabaseOperationWhen,
    records: Record[],
    context: any,
    disabledIntercepts: boolean | string[]
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
            context
          );
          if (!records) break;
        }
      }
    }
    return records;
  }
}
