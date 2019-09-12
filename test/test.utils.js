const {createLogger} = require("anysols-utils");

const session = {};
const MAX_TIMEOUT = 3500;
const logger = createLogger({label: "test", filePath: __dirname + '/test.log'});
module.exports = {
    session,
    MAX_TIMEOUT,
    logger
};


