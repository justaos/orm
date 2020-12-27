export default abstract class OperationInterceptorInterface {
  abstract getName(): string;

  abstract intercept(
    collectionName: string,
    operation: string,
    when: string,
    payload: any,
    context: any
  ): any;
}
