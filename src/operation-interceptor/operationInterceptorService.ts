import OperationInterceptor from "./operationInterceptor";
import AnysolsRecord from "../record/anysolsRecord";

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

    async intercept(collectionName: string, operation: string, when: string, payload: any): Promise<any> {
        const inactiveIntercepts: any = [];
        if (this.hasInterceptors())
            for (const [name, interceptor] of this.interceptors.entries())
                if (!inactiveIntercepts || !inactiveIntercepts.includes(name)) {
                    payload = await interceptor.intercept(collectionName, operation, when, payload);
                    if (!payload)
                        break;
                }
        return payload;
    }

};
