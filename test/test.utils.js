const {createLogger} = require("@plt4rm/utils");

const session = {};
const MAX_TIMEOUT = 3500;
const logger = createLogger({label: "test", filePath: __dirname + '/test.log'});
module.exports = {
    session,
    MAX_TIMEOUT,
    logger
};


