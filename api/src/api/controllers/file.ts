import fs from "fs";
import path from "path";
import VerbatimService from "../services/verbatimService";
import Setting from "../../config/setting";
import ApiResponse from "../../lib/apiResponse";

class File {

    public static async getFile (ctx: any, next: any) {
        const filename = ctx.params.filename;
        const filePath = path.join(__dirname, "../.tmp", filename);
        const response: ApiResponse = new ApiResponse("File.getFile");
        if (fs.existsSync(filePath)) {
            const fileData = fs.createReadStream(filePath);
            VerbatimService.instance.deleteFile(filePath);
            return ctx.body = fileData;
        }
        return ctx.body = response.apiError("No such file or directory");
    }
}
export default File;
