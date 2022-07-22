import path from "path";
import fs from "fs";
import Setting from "../../config/setting";
import excel from "exceljs";


class ExportVerbatimService {
    private static _singleton: boolean = true;
    private static _instance: ExportVerbatimService;

    constructor() {
        if (ExportVerbatimService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use ExportVerbatimService.instance instead!");
        }
    }

    public static get instance(): ExportVerbatimService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new ExportVerbatimService();
            this._singleton = true;
        }
        return this._instance;
    }
    public async export(data: any) {
        const filename = new Date().getTime() + ".xlsx";
        const dir = ".tmp";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const head = data[0];
        const workbook = new excel.Workbook();
        const sheet = workbook.addWorksheet("sheet1");
        // headers
        const header: any = [];
        header.push({header: head[0].text, key: head[0].text});
        header.push({header: head[1].text, key: head[1].text, width: head[1].style[3].width});
        sheet.getCell(1, 1).font = head[0].style[0].font_family;
        sheet.getCell(1, 1).alignment = { vertical: head[0].style[2].valign, horizontal: head[0].style[1].align};
        sheet.getCell(1, 2).font = head[1].style[0].font_family;
        sheet.getCell(1, 2).alignment = { vertical: head[1].style[2].valign, horizontal: head[1].style[1].align};
        for (let i = 3; i <= head.length; i++) {
            const obj = {
                header: head[i - 1].text,
                key: head[i - 1].text,
                width: head[i - 1].style[1].width
            };
            const style = head[i - 1].style;
            sheet.getCell(1, i).font = style[0].font_family;
            sheet.getCell(1, i).alignment = { vertical: "top", horizontal: style[2].align, wrapText: true};
            header.push(obj);
        }
        sheet.columns = header;
        // data part
        for (let i = 1; i < data.length; ++i) {
            for (let j = 1; j <= data[i].length; ++j) {
                sheet.getCell(i + 1, j).value = data[i][j - 1].text;
                sheet.getCell(i + 1, j).font = data[i][j - 1].style[0].font_family;
                sheet.getCell(i + 1, j).alignment = {vertical: "top", horizontal: "left", wrapText: true};
            }
        }
        await workbook.xlsx.writeFile(path.join(__dirname, "../.tmp", filename));
        return filename;
    }

}

export default ExportVerbatimService;