import {createLogger} from "anysols-utils";


export function getLoggerInstance(className: string) {
    return createLogger({label: "AnysolsUtils::" + className});
}
