import bunyan from "bunyan";
import Settings from "../config/setting";
import fileSystem from "fs";
import path from "path";

class Logger {

    public static readonly INFO_STR: string = "info";
    public static readonly WARN_STR: string = "warn";
    public static readonly ERROR_STR: string = "error";
    private static readonly FOLDER_NAME = ".logs";


    private static _singleton: boolean = true;
    private static _instance: Logger = undefined;


    private static logger: any;

    public static init(logPath: string): void {
        logPath = path.join(logPath, this.FOLDER_NAME) + "/";
        console.log("path: ", logPath);
        if (!fileSystem.existsSync(logPath)) {
            fileSystem.mkdirSync(logPath);
        }
        Logger.logger = bunyan.createLogger({
           name: Settings.APP_NAME,
           streams: [
               {
                   level: this.INFO_STR,
                   path: logPath + this.INFO_STR + ".log"
               },
               {
                    level: this.WARN_STR,
                    path: logPath + this.WARN_STR + ".log"
               },
               {
                    level: this.ERROR_STR,
                    path: logPath + this.ERROR_STR + ".log"
               }
           ]
        });
    }

    public static log(level: string, msg: string, context: Object = {}): void {
        switch (level) {
            case this.INFO_STR:
                this.logger.info(msg, context);
            break;
            case this.ERROR_STR:
                this.logger.error(msg, context);
            break;
            default:
                this.logger.info(msg, context);
            break;
        }
    }
}

export default Logger;
