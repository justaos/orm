import {createLogger} from "@plt4rm/utils";

const session: any = {};
const MAX_TIMEOUT = 3500;
const logger = createLogger({label: "test", filePath: __dirname + '/test.log'});

export {
    session,
    MAX_TIMEOUT,
    logger
};


