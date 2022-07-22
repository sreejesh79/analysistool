import VerbatimService from "../services/verbatimService";
import ApiResponse from "../../lib/apiResponse";
import ApiRequest from "../../lib/apiRequest";
import CryptoHelper from "../../util/cryptohelper";
import MediaService from "../services/mediaService";
import StudyService from "../services/studyService";
import ParticipantService from "../services/participantService";
import QuestionnaireService from "../services/questionaireService";
import ExportVerbatimService from "../services/exportVerbatimService";
import ArchiverService from "../services/archiverService";
import TagService from "../services/tagService";
import PostService from "../services/postService";
const mediaService: MediaService = MediaService.instance;
const participantService: ParticipantService = ParticipantService.instance;
const tagService: TagService = TagService.instance;
export default class Gallery {
    public static async getQuestionnaireVerbatim(req: ApiRequest, res: ApiResponse): Promise<any> {
        console.log("<<<<<<<<<<<<<<<<<<<< getQuestionnaireVerbatim >>>>>>>>>>>>>>>>>>>>>>>>");
        const startTime = Date.now();
        const body = req.body;
        const query = {study: body.studyid};
        if (body.posts && body.posts.length > 0) {
            query["posts"] = { $in: body.posts };
        }
        const response = await VerbatimService.instance.getQuestionnaireData(query);
        console.log('Time Taken: ' + (Date.now()-startTime)/1000);
        if (response.error) {
            return res.apiError(response.message);
        }
        return res.apiSuccess(response);
    }
    public static async getParticipants(req: ApiRequest, res: ApiResponse) {
        const body: any = req.body;
        const query = {study: body.studyid};
        if (body.participants && body.participants.length > 0) {
            query["_id"] = { $in: body.participants };
        }
        const response: any = await participantService.getStudyParticipants(query);
        if (response.error) {
            return res.apiError(response.message);
        } else {
            return res.apiSuccess(response);
        }
    }

    public static async getPostDataByIds(req: ApiRequest, res: ApiResponse): Promise<any> {
        const body: any = req.body;
        const response: any = await mediaService.getPostDataByIds(body.posts);
        if (response.error) {
            return res.apiError(response.message);
        } else {
            const postResponse = [];
            const newDbObject = {};
            for (let post of response) {
                if (post.media && post.media.length > 0) {
                    newDbObject["post"] = post._id;
                    const media = await MediaService.instance.getPostMedia(newDbObject);
                    if (media.error) {
                        return res.apiError(media.message);
                    }
                    post["media"] = media.body || [];
                    // if (media.body && media.body.length) {
                        postResponse.push(post);
                    // }
                }
            }
            return res.apiSuccess(postResponse);
        }
    }

    public static async getFilteredVerbatimData(req: ApiRequest, res: ApiResponse ) {
        const body: any = req.body;
        const decryptObj = CryptoHelper.decrypt(body.filter, process.env.NONCE);
        if (decryptObj.error) {
            return res.apiError(decryptObj);
        }
        const studyParticipants: any =  await VerbatimService.instance.getFilteredStudyParticipants({study: decryptObj.decryptedData[0].study }, decryptObj.decryptedData[0].participants);
        const studyQuestionnaireVerbatim: any = await VerbatimService.instance.getQuestionnaireData({study: decryptObj.decryptedData[0].study, tag: decryptObj.decryptedData[0].tags});
        return res.apiSuccess({
            studyParticipants,
            studyQuestionnaireVerbatim
        });
    }

    public static async getStudyMedia(req: ApiRequest, res: ApiResponse) {
        // console.log("<<<<<<<<<<<<<<<<<<<<<<< getStudyMedia >>>>>>>>>>>>>>>>>>>>>>");
        // const startTime = Date.now();
        const body: any = req.body;
        let users: any = [];
        if (body.users && body.users.length > 0) {
            users = body.users;
        } else {
            // fetch all participants user id for requested study
            let participants = await StudyService.instance.getStudyParticipants(body.studyid, "user");
            if (participants.error) {
                return res.apiError(participants.message);
            }
            users = participants.map(item => item.user);
        }

        let postFields = "";
        let mediaQuery = {};
        const postQuery = {isDeleted: false, study: body.studyid, user: {$in: users}};

        // filter by post ids if available
        if (body.posts && body.posts.length > 0) {
            postQuery["_id"] = { $in: body.posts};
        }

        // filter based on media model data for new study
        if (body.isNewStudy) {
            if (body.type && body.type == "image") {
                mediaQuery = { $or: [
                    {
                        $and: [
                            { imageObjectKey: {$nin: ["", undefined]} },
                            { videoObjectKey: {$in: ["", undefined]} }
                        ]
                    },
                    {image: { $ne: "" }, video: {$in: ["", undefined]}}
                ]};
            } else {
                mediaQuery = { $or: [
                    {
                        $and: [
                            { videoObjectKey: {$nin: ["", undefined]} }
                        ]
                    },
                    {video: { $ne: "" }}
                ] };
            }
        // filter based on post model data for old study 
        } else {
            if (body.type && body.type == "image") {
                postQuery["videoUrl"] = undefined;
                postFields = "_id imageUrl imageObjectKey user createdAt description";
            } else {
                postQuery["videoUrl"] = { $ne: undefined };
                postFields = "_id videoUrl videoObjectKey user createdAt imageObjectKey videoThumbnailUrl description";
            }
        }
        // return value for below API will be post model data for old studies and media model data with post field populated for new studies
        const response = await MediaService.instance.getStudyPosts(postQuery, postFields, mediaQuery, body.isNewStudy, body.skip, body.limit);
        // console.log('Time Taken: ' + (Date.now()-startTime)/1000);
        if (!response) {
            return res.apiSuccess({
                error: false,
                body: []
            });
        }
        if (response.error) {
            return res.apiError(response.message);
        }
        return res.apiSuccess(response);
    }

    // public static async getStudyMedia(req: ApiRequest, res: ApiResponse) {
    //     console.log("<<<<<<<<<<<<<<<<<<<<<<< getStudyMedia >>>>>>>>>>>>>>>>>>>>>>");
    //     const startTime = Date.now();
    //     const body: any = req.body;
    //     let participants = await StudyService.instance.getStudyParticipants(body.studyid);
    //     if (participants.error) {
    //         return res.apiError(participants.message);
    //     }
    //     participants = participants.map(item => item.user);
    //     const dbObject = {isDeleted: false, study: body.studyid, user: {$in: participants}};
    //     let selection = "";
    //     if (!body.isNewStudy) {
    //         if (body.type && body.type == "image") {
    //             dbObject["videoUrl"] = undefined;
    //             selection = "_id imageUrl user createdAt description";
    //         } else {
    //             dbObject["videoUrl"] = { $ne: undefined };
    //             selection = "_id videoUrl user createdAt videoThumbnailUrl description";
    //         }
    //     }
    //     let matchObject = {};
    //     if (body.type && body.type == "image") {
    //         matchObject["video"] = "";
    //     } else {
    //         matchObject["video"] = { $ne: "" };
    //     }
    //     const response = await MediaService.instance.getStudyPosts(
    //         dbObject, selection, matchObject,
    //         body.isNewStudy, body.skip, body.limit
    //     );
    //     console.log('Time Taken: ' + (Date.now()-startTime)/1000);
    //     if (!response) {
    //         return res.apiSuccess({
    //             error: false,
    //             body: []
    //         });
    //     }
    //     if (response.error) {
    //         return res.apiError(response.message);
    //     }
    //     return res.apiSuccess(response);
    // }

    public static async getQuestionnairePostData(req: ApiRequest, res: ApiResponse) {
        console.log("<<<<<<<<<<<<<<<<<<<< getQuestionnairePostData >>>>>>>>>>>>>>>>>>>>>>>>");
        const startTime = Date.now();
        const body: any = req.body;
        const query = {study: body.studyid};
        if (body.tags && body.tags.length > 0) {
            query["_id"] = { $in: body.tags };
        }
        if (body.posts && body.posts.length > 0) {
            query["posts"] = { $in: body.posts };
        }
        const questionnairePostData = await MediaService.instance.getQuestionnairePostData(query);
        if (questionnairePostData.error) {
            return res.apiError(questionnairePostData.message);
        }
        console.log('Time Taken: ' + (Date.now()-startTime)/1000);
        return res.apiSuccess(questionnairePostData);
    }

    public static async updatePostDescription(req: ApiRequest, res: ApiResponse) {
        const body: any = req.body;
        return await MediaService.instance.updatePostDescription(body.postid, body.description, body.isMedia);
    }
    public static async downloadVerbatim(req: ApiRequest, res: ApiResponse) {
        const body = req.body;
        const userType = req.socket["user"].userType;
        const participantData = await participantService.getParticipantsDataInArray(body.verbatims.participantIds);
        const questionnaireData = await QuestionnaireService.getQuestionnaireDataInArray(body.verbatims.tagIds);
        const tagsData = await tagService.getTagsDataInArray(body.verbatims.liveTagIds);
        const data = await VerbatimService.instance.exportData(userType, participantData, questionnaireData, tagsData);
        const filename = await ExportVerbatimService.instance.export(data);
        return res.apiSuccess({"filename": "/file/" + filename});
    }
    public static async downloadPosts(req: ApiRequest, res: ApiResponse) {
        const body = req.body;
        const studyName = await StudyService.instance.getStudyName(body.studyId, req);
        if (studyName.error) {
            return res.apiError(studyName.message);
        }
        let urls = [];
        let mediaObjectKeys = [];
        if (studyName.isNewStudy) {
            const type = body.type == "image" ? "image imageObjectKey" : "video videoObjectKey";
            const posts = await PostService.instance.getMediaArray(body.postIds, type);
            urls = (posts || []).map(item => (body.type == "image") ? (item["imageObjectKey"] || item["image"]) : (item["videoObjectKey"] || item["video"]));

        } else {
            const type = body.type == "image" ? "imageUrl" : "videoUrl";
            const posts = await PostService.instance.getPostsArray(body.postIds, type);
            urls = (posts || []).map(item => item[type]);
        }
        const filename = await ArchiverService.instance.createZip(studyName.name, urls);
        return res.apiSuccess({"filename": "/file/" + filename});
    }

    public static async getTagsDataByIds(req: ApiRequest, res: ApiResponse) {
        const body = req.body;
        let questionnaireData: any = [];
        let tagsData: any = [];
        let participantsData: any = await participantService.getParticipantUserInStudy({study: body.studyid, user: body.userid});
        if(participantsData.error) {
            return res.apiError(participantsData.message);
        }
        if(body.tags.task) {
            //questionnaire data
            questionnaireData = await VerbatimService.instance.getQuestionnaireData({study: body.studyid, _id: { $in: body.tags.task}});
            if(questionnaireData.error) {
                return res.apiError(questionnaireData.message);
            }
        }
        if(body.tags.tag) {
            //tags data
            tagsData = await tagService.getTagData({ _id: { $in: body.tags.tag}});
            if(tagsData.error) {
                return res.apiError(tagsData.message);
            }
        }
        return res.apiSuccess({
            participantsData, questionnaireData, tagsData
        });
    }

    public static async deleteMedia (req: ApiRequest, res: ApiResponse) {
        const body = req.body;
        const studyInfo = await StudyService.fetchStudy(body.study);
        const type = studyInfo.isNewStudy ? "media" : "post";
        const response = await PostService.instance.delete({_id:body.post}, type, body.type);
        if (response.error) {
            return res.apiError(response.message);
        }
        return res.apiSuccess(response);
    }

}