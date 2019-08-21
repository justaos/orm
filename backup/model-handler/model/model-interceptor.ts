export interface ModelInterceptor {

    intercept(modelName: string, operation: string, when: string, records: any): any;

}
