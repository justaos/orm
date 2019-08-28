export default abstract class OperationInterceptor {

    abstract getName(): string;

    abstract intercept(collectionName: string, operation: string, when: string, records: any): any;

}
