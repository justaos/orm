export default class DatabaseConfiguration {

    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    dialect: string;

    constructor(config: any){
        this.host = config.host;
        this.port = config.port;
        this.name = config.name;
        this.user = config.user;
        this.password = config.password;
        this.dialect = config.dialect;
    }

    getUri(){
        return `${this.dialect}://${this.host}:${this.port}/${this.name}`;
    }

}