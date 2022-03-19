import Record from '../record/Record';

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
    operation: string,
    when: string,
    records: Record[],
    context: any
  ): any;
}
