import StudyModel from "../models/study";
import StudyCountModel from "../models/study_count";
import TagModel from "../models/tag";
import QuestionnairesModel from "../models/questionnaire";
import ApiRequest from "../../lib/apiRequest";
import UserModel from "../models/user";
import { Socket } from "net";
import SocketService from "../../lib/remoting/socketservice";
import participantModel from "../models/participant";
import UserType from "../../common/constants";
import PostModel from "../models/post";
import MediaModel from "../models/media";
class StudyService {

    private static _singleton: boolean = true;
    private static _instance: StudyService;

    constructor() {
        if (StudyService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use StudyService.instance instead!");
        }
    }

    public static get instance(): StudyService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new StudyService();
            this._singleton = true;
        }
        return this._instance;
    }

    public async get(context: string, req: ApiRequest, filter: any, skip?: number, limit?: number): Promise<any>  {
        const q_skip = skip ? skip : 0;
        const q_limit = limit ? limit : 5;
        let studyData: any = [];
        const user: any = req.socket.user;
        let userStudies: any = [];
        if (user.userType !== UserType.ADMIN && user.userType !== UserType.PROSPECT ) {
            userStudies = await UserModel.findOne({"_id": user._id}).select("studies").lean().exec();
            filter["study"] = { $in: userStudies.studies };
        }
        try {
            const studyId: string[] = [];

            let count: number ;
            if (q_skip == 0) {
               count = await StudyCountModel.count(filter).exec();
            }
            studyData = await StudyCountModel.find(filter)
            .populate({path: "study", model: StudyModel, select: "name brandImageUrl createdAt isNewStudy imageObjectKey"})
            .sort("name")
            .skip(q_skip)
            .limit(q_limit)
            .lean()
            .exec();

            for (const studyObj of studyData) {
                studyId.push(studyObj.study._id);
                studyObj["id"] = studyObj.study._id;
                studyObj["name"] = studyObj.study.name;
                studyObj["createdAt"] = studyObj.study.createdAt;
                studyObj["brandImageUrl"] = studyObj.study.brandImageUrl;
                studyObj["imageObjectKey"] = studyObj.study.imageObjectKey;
                studyObj["isNewStudy"] = studyObj.study.isNewStudy;
                if (studyObj.study.isNewStudy) {
                    let participants = await this.getStudyParticipants(studyObj.study._id);
                    participants = participants.map(item => item.user);
                    let imageCount = 0;
                    let videoCount = 0;
                    const posts = await PostModel.find({"study": studyObj.study._id, isDeleted: false, user: {$in: participants}}).distinct("_id").lean().exec();
                    if (posts && posts.length > 0) {
                        let imageQuery = {
                            $and: [
                                { post: {$in: posts} },
                                {
                                    $or: [
                                        {
                                            $and: [
                                                { imageObjectKey: {$nin: ["", undefined]} },
                                                { videoObjectKey: {$in: ["", undefined]} }
                                            ]
                                        },
                                        {image: { $ne: "" }, video: {$in: ["", undefined]}}
                                    ]
                                }
                            ]
                        };
                        imageCount = await MediaModel.count(imageQuery).lean().exec();
                        let videoQuery = {
                            $and: [
                                { post: {$in: posts} },
                                {
                                    $or: [
                                        {
                                            $and: [
                                                { videoObjectKey: {$nin: ["", undefined]} }
                                            ]
                                        },
                                        { video: { $ne: "" } }
                                    ]
                                }
                            ]
                        };
                        videoCount = await MediaModel.count(videoQuery).lean().exec();
                    }
                    studyObj["images"] = imageCount;
                    studyObj["videos"] = videoCount;
                }
                
                delete studyObj.study;
                delete studyObj._id;
            }

            if (count) {
                SocketService.instance.dispatchData(context, req.socket, {"count": count, "studies": studyData});
            } else {
                SocketService.instance.dispatchData(context, req.socket, {"studies": studyData});
            }

            for (const [index, study] of studyData.entries()) {
                const tags = await TagModel.find({"study": study.id}).select("study name posts texts").lean().exec();
                const questionnairesTag = await QuestionnairesModel.find({"study": study.id}).select("study tag posts texts").lean().exec();
                let studyTags: string[] = [];
                questionnairesTag.sort((a: any, b: any) => {
                    return (a.texts.length + a.posts.length) > (b.texts.length + b.posts.length) ? -1 : (a.texts.length + a.posts.length) < (b.texts.length + b.posts.length) ? 1 : 0;
                });
                tags.sort((a: any, b: any) => {
                    return (a.texts.length + a.posts.length) > (b.texts.length + b.posts.length) ? -1 : (a.texts.length + a.posts.length) < (b.texts.length + b.posts.length) ? 1 : 0;
                });
                studyTags = studyTags.concat(questionnairesTag);
                studyTags = studyTags.concat(tags);
                SocketService.instance.dispatchData(context, req.socket, {"index": q_skip + index, "tags": studyTags});
            }
        } catch (e) {
            return {
                error: true,
                body: "Error Fetching Study Counts Data"
            };
        }

        return {
            error: false,
            body: {"message": "success"}
        };
    }
    public static async fetchStudy(studyId: string): Promise<any> {
        return await StudyModel.findOne({ _id: studyId});
    }
    public async getStudyInfo(studyId: string, selectFields: string = "isNewStudy"): Promise<any> {
        return await StudyModel.findOne({_id: studyId}).select(selectFields).lean().exec();
    }
    public async getStudyName(studyId: string, req: any): Promise<any> {
        const user = req.socket.user;
        if (user.userType !== UserType.ADMIN && user.userType !== UserType.PROSPECT ) {
            const userStudies = await UserModel.findOne({"_id": user._id}).select("studies").lean().exec();
            const index = userStudies.studies.map(item => item + "").indexOf(studyId);
            if (index == -1) {
                return {error: true, message: "Invalid Study Id"};
            }
        }
        return await StudyModel.findOne({_id: studyId}).select("name isNewStudy").lean();
    }
    public async getStudyParticipants(studyId: string, selection: string = ""): Promise<any> {
        let participants = [];
        try {
            participants = await participantModel.find({study: studyId})
            .select(selection)
            .lean()
            .exec();
        } catch (e) {
            return {error: true, message: "Invalid Study Id"};
        }
        return participants;

    }

    public async getStudyList(query): Promise<any> {
        let studies = [];
        try {
            studies = await StudyModel.find(query).select("name client")
            .lean()
            .exec();
        } catch (e) {
            return {error: true, message: "Invalid Study Id"};
        }
        console.log("studies", studies.length);
        return studies;

    }

    public async getStudyNameById(studyId: string): Promise<any> {
        console.time("get_study_name");
        const study = await StudyModel.findOne({_id: studyId}).select({"name": 1, "isNewStudy": 1}).lean();
        console.timeEnd("get_study_name");
        return study;
    }
}

export default StudyService;