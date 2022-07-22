import archiver from "archiver";
import fs from "fs";
import request from "request";
import path from 'path';
import MediaService from "./mediaService";

const _mediaService = MediaService.instance;
class ArchiverService {
    private static _singleton: boolean = true;
    private static _instance: ArchiverService;
    constructor() {
        if (ArchiverService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use ArchiverService.instance instead!");
        }
    }

    public static get instance(): ArchiverService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new ArchiverService();
            this._singleton = true;
        }
        return this._instance;
    }
    public async createZip(studyName: string, urls: any) {
        // console.log("objectKeys: ", objectKeys);
        studyName = studyName.replace(/[^a-zA-Z0-9]/g , "_");
        if (studyName.replace(/_/g, "").length === 0) {
            studyName = "Non_English";
        }
        const folderName = studyName + " - " + new Date().getTime();
        const directory = ".tmp/";
        const tempDir = path.resolve(__dirname, "../", directory);
        console.log("tempDir", tempDir);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const dir = directory + folderName;
        const folderPath = tempDir + "/" + folderName;
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        urls = urls.filter(item=>(item != undefined && item != ""));
        const questionnaires = urls.map((url: any, index) => {
            const isMediaObjectKey = url.indexOf("http") == -1;
            if(isMediaObjectKey) {
                return new Promise(async (resolve) => {
                    const file = url.split(".");
                    const fName = "file" + (index + 1) + "." + file[1];
                    const req = await _mediaService.getFileFromS3(folderPath, url, fName, resolve);
                });
            }
            else {
                return new Promise(async (resolve) => {
                    const link = url.split("/");
                    const file = link[link.length - 1].split(".");
                    const fName = "file" + (index + 1) + "." + file[file.length - 1];
                    const req = await this.downloadFile(url, folderPath + "/" + fName, resolve);
                });
            }

        });
        const r = await Promise.all(questionnaires);
        /*const newMedias = objectKeys.map((objectKey: any, index: any) => {
            return new Promise(async (resolve) => {
                const file = objectKey.split(".");
                const fName = "file" + (index + 1) + "." + file[1];
                const req = await _mediaService.getFileFromS3(folderPath, objectKey, fName, resolve);
            });
        })
        await Promise.all(newMedias);*/
        // console.log("all files created");
        return new Promise((resolve) => this.zipFile(dir, studyName, resolve));
    }
    private async downloadFile(url: string, destinationPath: string, resolve) {
        // console.log("destinationPath", destinationPath);
        try {
            request(url)
            .pipe(fs.createWriteStream(destinationPath))
            .on("finish", () => {
                resolve()
            })
            .on("error", (err1) => {
                resolve();
            });
        } catch (e) {
            return resolve();
        }
    }
    private zipFile(dir, studyName, resolve) {
        // console.log("dir", dir);
        const filename = studyName + " - " + new Date().getTime() + ".zip";
        const directory = ".tmp/";
        const zipFilePath = path.join(__dirname, "../", directory) + filename;
        // console.log("zipFilePath", zipFilePath);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver("zip", {
            zlib: { level: 9 } // Sets the compression level.
          });
        output.on("close", function() {
            // console.log(archive.pointer() + " total bytes");
            // console.log("archiver has been finalized and the output file descriptor has closed.");
            const paths = path.join(__dirname , "../" , dir);
            // console.log("paths", paths);
            fs.readdirSync(paths).forEach(function(file, index){
                const curPath = paths + "/" + file;
                fs.unlinkSync(curPath);
              });
              fs.rmdirSync(paths);
              resolve(filename);
          });
        archive.pipe(output);
        archive.directory(path.resolve(__dirname, "../", dir), studyName);
        archive.finalize();
        // return filename;
    }
}
export default ArchiverService;