import CommentModel from "../models/comment";
import UserModel from "../models/user";
import path from "path";
import fs from "fs";
import excel from "exceljs";
import LocaleCommentModel from "../models/localecomment";

class SearchService {

    private static _singleton: boolean = true;
    private static _instance: SearchService;

    constructor() {
        if (SearchService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use SearchService.instance instead!");
        }
    }

    public static get instance(): SearchService {
        if (!this._instance) {
            this._singleton = false;
            this._instance = new SearchService();
            this._singleton = true;
        }
        return this._instance;
    }

    public async searchTextInComments (regxObjArr, postIds, userIds): Promise<any> {
        let allComments: any = [];
        try {
            let comments = await CommentModel.find({isDeleted: false, post: {$in: postIds}, text: {$in: regxObjArr}, createdBy: {$in: userIds}})
            .populate({ path: "createdBy", model: UserModel, select: "firstName lastName"})
            .lean().exec();
            allComments = allComments.concat(comments);
            
            // check in locale comment as well as locale comments can also be tagged
            let localeComment = await LocaleCommentModel.find({text: {$in: regxObjArr}})
            .populate({ path: "comment", model: CommentModel, match:{post: {$in: postIds}, createdBy: {$in: userIds} }, populate: {path: "createdBy", model: UserModel}})
            .lean().exec();
            for (var lc of localeComment) {
                if (lc.comment) {
                    lc['createdBy'] = lc.comment.createdBy;
                    lc['post'] = lc.comment.post;
                    delete lc.comment;
                    allComments = allComments.concat(lc);
                }
            }
        } catch (e) {
            return {error: true, message: "Invalid Post Id(s)"};
        }
        return allComments;
    }

    public async getCommentsByIds (commentIds): Promise<any> {
        let comments: any = [];
        try {
            comments = await CommentModel.find({isDeleted: false, _id: {$in: commentIds}})
            .populate({ path: "createdBy", model: UserModel, select: "firstName lastName"})
            .lean().exec();
        } catch (e) {
            return {error: true, message: "Invalid Comment Id(s)"};
        }
        return comments;
    }

    public async getLocaleCommentsByIds (localeCommentIds, populateCommentObj=false): Promise<any> {
        let localeComments: any = [];
        try {
            if (populateCommentObj) {
                localeComments = await LocaleCommentModel.find({_id: {$in: localeCommentIds}})
                    .populate({ path: "comment", model: CommentModel })
                    .lean().exec();
            } else {
                localeComments = await LocaleCommentModel.find({_id: {$in: localeCommentIds}})
                    .lean().exec();
            }
        } catch (e) {
            return {error: true, message: "Invalid Locale Comment Id(s)"};
        }
        return localeComments;
    }

    public async export(data: any) {
        const filename = new Date().getTime() + ".xlsx";
        const dir = ".tmp";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const workbook = new excel.Workbook();
        const sheet = workbook.addWorksheet("sheet1");
        for (let i = 0; i < data.length; ++i) {
            sheet.addRow(data[i]);
            for(let k=0;k<data[i].length;k++){
                if(i==0){
                    sheet.getCell(i+1, k+1).fill = {
                        type: 'gradient',
                        gradient: 'path',
                        center:{left:0.5,top:0.5},
                        stops: [
                            {position:0, color:{argb:'27a1efFF'}},
                            {position:1, color:{argb:'27a1efFF'}}
                        ]
                    };
                }
                sheet.getCell(i+1, k+1).alignment = { vertical: 'top', wrapText: true , indent: 1};
            }

        }
        await workbook.xlsx.writeFile(path.join(__dirname, "../.tmp", filename));
        return filename;
    }
}

export default SearchService;