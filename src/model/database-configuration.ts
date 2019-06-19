export default class DatabaseConfiguration {

    private readonly host: string;
    private readonly port: number;
    private readonly database: string;
    private readonly username: string;
    private readonly password: string;
    private readonly dialect: string;

    constructor(host: string = "127.0.0.1", port: number = 3306, database: string, username: string = "root", password: string = "root", dialect: string) {
        this.host = host;
        this.port = port;
        this.database = database;
        this.username = username;
        this.password = password;
        this.dialect = dialect;
    }

    getUri() {
        if (this.username && this.password)
            return `${this.dialect}://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`;
        return `${this.dialect}://${this.host}:${this.port}/${this.database}`;
    }

    getUriWithoutDatabase() {
        if (this.username && this.password)
            return `${this.dialect}://${this.username}:${this.password}@${this.host}:${this.port}/`;
        return `${this.dialect}://${this.host}:${this.port}/`;
    }

    getDatabaseName() {
        return this.database;
    }

}
