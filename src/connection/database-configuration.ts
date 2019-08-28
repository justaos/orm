export default class DatabaseConfiguration {

    private readonly host: string;
    private readonly port: number;
    private readonly database: string | undefined;
    private readonly username: string | undefined;
    private readonly password: string | undefined;
    private readonly dialect: string;

    constructor(host: string = "localhost", port: number = 27017, database: string | undefined, username: string | undefined, password: string | undefined, dialect: string = 'mongodb') {
        this.host = host;
        this.port = port;
        this.database = database;
        this.username = username;
        this.password = password;
        this.dialect = dialect;
    }

    getUri() {
        if (this.database)
            return `${this.getUriWithoutDatabase()}/${this.database}`;
        return this.getUriWithoutDatabase();
    }

    getUriWithoutDatabase() {
        if (this.username && this.password)
            return `${this.dialect}://${this.username}:${this.password}@${this.host}:${this.port}`;
        return `${this.dialect}://${this.host}:${this.port}`;
    }

    getDatabaseName() {
        return this.database;
    }

}
