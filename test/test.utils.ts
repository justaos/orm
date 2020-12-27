import Logger from "@p4rm/logger-utils";

const session: any = {};
const MAX_TIMEOUT = 5000;
const logger = Logger.createLogger({label: "test", filePath: __dirname + '/test.log'});

export {
    session,
    MAX_TIMEOUT,
    logger
};


