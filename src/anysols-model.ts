import DatabaseService from "./database/database-service";
import ModelInterceptorProvider from "./model-handler/model-interceptor-provider";
import ModelInterceptor from "./model-handler/model/model-interceptor";
import ModelBuilder from "./service/model-builder";

export class AnysolsModel extends DatabaseService {

    private readonly interceptProvider: ModelInterceptorProvider;

    constructor() {
        super();
        this.interceptProvider = new ModelInterceptorProvider();
    }

    isModelDefined(modelName: string) {
        return this.getModelService().isModelDefined(modelName);
    }

    defineModel(schemaDefinition: any) {
        this.getModelService().defineModel(schemaDefinition);
    }

    addInterceptor(name: string, interceptor: ModelInterceptor) {
        this.interceptProvider.addInterceptor(name, interceptor);
    }


    model(modelName: string): any {
        let modelBuilder = new ModelBuilder();
        modelBuilder.setModelName(modelName);
        modelBuilder.setInterceptProvider(this.interceptProvider);
        modelBuilder.setMongooseModel(this.getModelService().model(modelName));
        return modelBuilder.build();
    }

    registerFieldDefinition(): any {

    }

}
