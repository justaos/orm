export default class DatabaseConfiguration {

    private readonly host: string;
    private readonly port: number;
    private readonly database: string | undefined;
    private readonly username: string | undefined;
    private readonly password: string | undefined;
    private readonly dialect: string;
    private readonly connectTimeoutMS: number | undefined;

    constructor(host: string = "localhost", port: number = 27017, dialect: string = 'mongodb', database?: string, username?: string, password?: string, connectTimeoutMS?: number) {
        this.host = host;
        this.port = port;
        this.database = database;
        this.username = username;
        this.password = password;
        this.dialect = dialect;
        this.connectTimeoutMS = connectTimeoutMS;
    }

    getUri() {
        let uri = this.getUriWithoutDatabase();
        if (this.database)
            uri = `${uri}/${this.database}`;
        if (this.connectTimeoutMS)
            return `${uri}?connectTimeoutMS=${this.connectTimeoutMS}`;
        return uri;
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
