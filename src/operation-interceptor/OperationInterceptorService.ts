import OperationInterceptorInterface from './OperationInterceptor.interface';

export default class OperationInterceptorService {
  interceptors: Map<string, OperationInterceptorInterface>;

  constructor() {
    this.interceptors = new Map<string, OperationInterceptorInterface>();
  }

  addInterceptor = (operationInterceptor: OperationInterceptorInterface) =>
    this.interceptors.set(operationInterceptor.getName(), operationInterceptor);

  deleteInterceptor = (name: string) => this.interceptors.delete(name);

  getInterceptor = (name: string): OperationInterceptorInterface | undefined =>
    this.interceptors.get(name);

  hasInterceptors(): boolean {
    return this.interceptors.size !== 0;
  }

  #getSortedIntercepts(): OperationInterceptorInterface[] {
    const intercepts = [];
    for (const [name, interceptor] of this.interceptors.entries()) {
      intercepts.push(interceptor);
    }
    return intercepts.sort((a, b) => a.getOrder() - b.getOrder());
  }

  async intercept(
    collectionName: string,
    operation: string,
    when: string,
    payload: any,
    context: any = {},
    inactiveIntercepts: any
  ): Promise<any> {
    if (this.hasInterceptors())
      for (const interceptor of this.#getSortedIntercepts())
        if (!inactiveIntercepts || !inactiveIntercepts.includes(name)) {
          payload = await interceptor.intercept(
            collectionName,
            operation,
            when,
            payload,
            context
          );
          if (!payload) break;
        }
    return payload;
  }
}
