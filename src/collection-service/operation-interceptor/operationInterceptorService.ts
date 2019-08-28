import OperationInterceptor from "./operationInterceptor";
import Record from "../record/record";

export default class OperationInterceptorService {

    interceptors: Map<string, OperationInterceptor>;

    constructor() {
        this.interceptors = new Map<string, OperationInterceptor>();
    }

    addInterceptor = (operationInterceptor: OperationInterceptor) => this.interceptors.set(operationInterceptor.getName(), operationInterceptor);

    deleteInterceptor = (name: string) => this.interceptors.delete(name);

    getInterceptor = (name: string): OperationInterceptor | undefined => this.interceptors.get(name);

    hasInterceptors(): boolean {
        return (this.interceptors.size !== 0);
    }

    async intercept(collectionName: string, operation: string, when: string, records: Record[]): Promise<Record[]> {
        const inactiveIntercepts: any = [];
        if (this.hasInterceptors())
            for (const [name, interceptor] of this.interceptors.entries())
                if (!inactiveIntercepts || !inactiveIntercepts.includes(name)) {
                    records = await interceptor.intercept(collectionName, operation, when, records);
                    if (!records)
                        break;
                }
        return records;
    }


    async interceptRecord(collectionName: string, operation: string, when: string, record: Record): Promise<Record> {
        const updatedRecords = await this.intercept(collectionName, operation, when, [record]);
        return updatedRecords[0];
    }

};
