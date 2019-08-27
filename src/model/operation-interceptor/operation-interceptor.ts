export default abstract class OperationInterceptor {

    abstract getName(): string;

    abstract intercept(modelName: string, operation: string, when: string, records: any): any;

}
