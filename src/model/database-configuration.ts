export default class DatabaseConfiguration {

    private readonly host: string;
    private readonly port: number;
    private readonly name: string;
    private readonly username: string;
    private readonly password: string;
    private readonly dialect: string;

    constructor(host: string, port: number, name: string, username: string, password: string, dialect: string) {
        this.host = host;
        this.port = port;
        this.name = name;
        this.username = username;
        this.password = password;
        this.dialect = dialect;
    }

    getUri() {
        if (this.username && this.password)
            return `${this.dialect}://${this.username}:${this.password}@${this.host}:${this.port}/${this.name}`;
        return `${this.dialect}://${this.host}:${this.port}/${this.name}`;
    }

    getDatabaseName() {
        return this.name;
    }

}
