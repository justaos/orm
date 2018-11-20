export default class DatabaseConfiguration {

    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    dialect: string;

    constructor(host: string, port: string, name: string, user: string, password: string, dialect: string){
        this.host = host;
        this.port = port;
        this.name = name;
        this.user = user;
        this.password = password;
        this.dialect = dialect;
    }

    getUri(){
        return `${this.dialect}://${this.host}:${this.port}/${this.name}`;
    }

}
