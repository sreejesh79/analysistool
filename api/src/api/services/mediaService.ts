import PostModel from "../models/post";
import QuestionnaireModel from "../models/questionnaire";
import PostService from "./postService";
import CommentModel from "../models/comment";
import questionnaireParticipantModel from "../models/questionnaire_participants";
import MediaModel from "../models/media";
import UserModel from "../models/user";
import AWS from "aws-sdk";
import FileSystem from "fs";
class MediaService {
    private static _singleton: boolean = true;
    private static _instance: MediaService;
    private s3bucket: any = new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, 
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
        signatureVersion: "v4",
        region: process.env.AWS_S3_REGION
    });
    constructor() {
        if (MediaService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use MediaService.instance instead!");
        }
    }

    public static get instance(): MediaService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new MediaService();
            this._singleton = true;
        }
        return this._instance;
    }

    public async getFileFromS3(folderPath: any, objectKey: any, fName, resolve) {
        try {
            if (!FileSystem.existsSync(folderPath)) {
                FileSystem.mkdirSync(folderPath);
            }
            const params = { Bucket: process.env.AWS_S3_BUCKET, Key: objectKey };
            const filePath = `${folderPath}/${fName}`;
            console.log("download filePath: ", filePath);
            const file = FileSystem.createWriteStream(filePath);
            this.s3bucket.getObject(params).createReadStream()
                .pipe(file).on("finish", () => {
                    resolve();
                }).on("error", (err1) => {
                    resolve();
                });
        } catch (e) {
            console.log("e: ", e);
            return resolve();
        }
    }

    public async getStudyPosts(postQuery: any, postFields: string, mediaQuery: any, isNewStudy: any, skip: any, limit:any): Promise<any> {
        let mediaPosts: any = [];
        let studyPosts: any = [];
        try {
            // filter based on media model data for new study
            if (isNewStudy) {
                const validPosts = await PostModel.find(postQuery).distinct("_id").lean().exec();
                let updatedMediaQuery = {};
                if (Object.keys(mediaQuery).length === 0) {
                    updatedMediaQuery = {
                        "post": {$in: validPosts}
                    }
                } else {
                    updatedMediaQuery = {
                        $and: [
                            {"post": {$in: validPosts}},
                            {...mediaQuery}
                        ]
                    }
                }
                mediaPosts = MediaModel.find(updatedMediaQuery).populate({path: "post", populate: {path: "user", select: "userType lastName firstName"}});
                if (typeof(skip) == "number" && typeof(limit) == "number") {
                    mediaPosts = mediaPosts.skip(skip).limit(limit);
                }
                mediaPosts = await mediaPosts.populate({ path: "createdBy", model: UserModel, select: "userType lastName firstName"}).lean().exec();
                return mediaPosts;
            // filter based on post model data for old study 
            } else {
                studyPosts = PostModel.find(postQuery).select(postFields);
                if (typeof(skip) == "number" && typeof(limit) == "number") {
                    studyPosts = studyPosts.skip(skip).limit(limit);
                }
                studyPosts = await studyPosts.populate("user", "userType lastName firstName").lean().exec();
                return studyPosts;
            }
        } catch (e) {
            return {error: true, message: "Invalid Media Information"};
        }
    }

    // this function needs to refactored it should find in media model and limit / skip should work on that
    // public async getStudyPosts(
    //     dbObject: any,
    //     selection: string,
    //     matchObject: any,
    //     isNewStudy: any,
    //     skip: any, 
    //     limit:any): Promise<any> {
    //     let studyPosts:any = [];
    //     try {
    //         studyPosts = PostModel.find(dbObject).select(selection);           
    //         if (typeof(skip) == "number" && typeof(limit) == "number") {
    //             console.log("added limit");
    //             studyPosts = studyPosts.limit(limit).skip(skip);
    //         }
    //         if(isNewStudy) {
    //             studyPosts = studyPosts.populate({path:"media",match: matchObject, populate: {path: "createdBy", model: UserModel, select: "userType lastName firstName"}});
    //         }
    //         studyPosts = await studyPosts.populate("user", "userType lastName firstName").lean().exec();
    //     } catch (e) {
    //         return {error: true, message: "Invalid Media Information"};
    //     }
    //     return studyPosts;
    //     //return  isNewStudy ? studyPosts.filter(post => post.media.length > 0) : studyPosts;
    //  }

    public async getPostMedia(dbObject: any): Promise<any> {
        let media: any;
        try {
            media = await MediaModel.find(dbObject).populate({ path: "createdBy", model: UserModel, select: "userType lastName firstName"}).lean().exec();
        } catch (e) {
            return {
                error: true,
                message: e.message
            }
        }
        return {
            error: false,
            body: media
        }
    }

    public async getPostDataByIds(posts): Promise<any> {
        return await PostService.instance.getPostDataByIds(posts, "imageObjectKey videoObjectKey videoThumbnailUrl imageUrl videoUrl media");
    }

    public async getQuestionnairePostData(query: any): Promise<any> {
        let questionnairePostData = [];
        try {
            questionnairePostData = await QuestionnaireModel.find(query)
            .sort("tag")
            .populate({path:"texts", model: "QuestionnaireParticipant", populate:{ path:"entity", select: "comment post", populate: {path: "comment", model: "Comment", select: "post"}}})
            .lean()
            .exec();
            questionnairePostData = this.parseQuestionnaireData(questionnairePostData);
        } catch (e) {
            return {error: true, message: "Invalid Study Id"};
        }
        return questionnairePostData;
    }

    private parseQuestionnaireData(questionnaireData: any) {
        questionnaireData = questionnaireData.map(questionnaire => {
            questionnaire.texts = questionnaire.texts.filter(questionnaireParticipant => {
                if(questionnaireParticipant.entity) {
                    questionnaireParticipant.comment = Object.assign({}, questionnaireParticipant.entity);
                    if(questionnaireParticipant.onModel === "Comment") {
                        delete questionnaireParticipant.entity;
                        return true;
                    }
                    else if(questionnaireParticipant.onModel === "LocaleComment" && questionnaireParticipant.entity.comment) {
                        questionnaireParticipant.comment["post"] = questionnaireParticipant.entity.comment.post;
                        delete questionnaireParticipant.entity;
                        delete questionnaireParticipant.comment.comment;
                        return true;
                    }
                }
                return false;
            })
            return questionnaire;
        });
        return questionnaireData;
    }

    public async updatePostDescription(postId: string, description: string, isMedia: boolean) {
        const model = isMedia ? MediaModel : PostModel;
        return await model.update({_id: postId}, {description: description})
                        .lean()
                        .exec();
    }
}
export default MediaService;