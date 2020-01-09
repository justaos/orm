import {createLogger} from "@plt4rm/utils";

export function getLoggerInstance(className: string) {
    return createLogger({label: "ODM::" + className});
}
