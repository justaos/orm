const DatabaseConfiguration = require("../lib/core/connection/databaseConfiguration").default;
const DatabaseConnection = require("../lib/core/connection/databaseConnection").default;

var config = {
    host: "localhost",
    port: "27017",
    database: "anysols",
    dialect: "mongodb"
};

let dbConfig = new DatabaseConfiguration(config.host, config.port, config.database, config.username, config.password, config.dialect);

DatabaseConnection.connect(dbConfig).then((conn) => {
    conn.deleteAllIndexes();
});
