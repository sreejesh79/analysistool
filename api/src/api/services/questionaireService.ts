import * as xlsx from 'node-xlsx';
import questionnaireParticipantModel from "../models/questionnaire_participants";
import questionnaireModel from "../models/questionnaire";
import tagsModel from "../models/tag";
import PostService from './postService';
import CommentModel from '../models/comment';
import Extras from '../../util/exras';
import LocaleCommentModel from '../models/localecomment';

class QuestionnaireService {

    private static doNotUse() {
        // Do not use this function
        // This function is just to import LocaleCommentModel within the module so as to avoid below error:
        // Schema not registered for model
        CommentModel.find().lean().exec();
        LocaleCommentModel.find().lean().exec();
    }

    public static parseXLSX(cb: any, filePath: any) {
        const xlsxParsedData = xlsx.parse(filePath);
        const xlsxData = xlsxParsedData[0].data;
        xlsxData.shift();

        const finalxlsxData = [];
        const arrTags = [];
        for (let i = 0; i < xlsxData.length; i++) {
            const data = xlsxData[i];
            if (data.length > 0) {
                if (!data[0] || !data[1]) {
                    return cb("Tag/Task field is missing at line number " + (i + 1) + ".");
                }
                const trimmedTag = (data[0] || "").trim();
                const index = arrTags.indexOf(trimmedTag);
                if (index != -1) {
                    const resObj = [{ "tag": finalxlsxData[index][0], "task": finalxlsxData[index][1]}, { "tag": data[0], "task": data[1] }];
                        return cb(resObj);
                }
                arrTags.push(trimmedTag);
                finalxlsxData.push(data);
            }

        }
        cb(undefined, finalxlsxData);
    }
    public static createQuestionnaire(cb: any, studyId: any, data: any, createdBy: any) {
        const questionnaireData: any[] = [];
        const questionnaires = data.map((element: any) => {
            return new Promise((resolve) => {
                if (element.length == 0) return resolve();
                return tagsModel.find({name : element[0], study: studyId}, function (err: any, tag: any) {
                    if (err) {
                        return cb(err);
                    }
                    if (!tag) {
                        resolve();
                    } else {
                        const questionnaire: any = {};
                        questionnaire["tag"] = element[0];
                        questionnaire["task"] = element[1];
                        questionnaire["study"] = studyId;
                        questionnaire["createdBy"] = createdBy;
                        questionnaireModel.create(questionnaire, function (err: any, createdQuestionnaire: any) {
                            if (err) {
                                return cb(err);
                            }
                            questionnaireData.push(createdQuestionnaire);
                            resolve();
                        });
                    }
                });
            });
        });
        Promise.all(questionnaires).then(() => cb(undefined, questionnaireData));
    }
    public static update(cb: any, studyId: any, data: any, createdBy: any) {
        const questionnaireData: any[] = [];
        const questionnaires = data.map((element: any) => {
            return new Promise((resolve) => {
                if (element.length == 0)return resolve();
                const questionnaire: any = {};
                questionnaire["task"] = element[1];
                questionnaire["createdBy"] = createdBy;
                return tagsModel.find({name : element[0], study: studyId}, function (err: any, tag: any) {
                    if (err) {
                        return cb(err);
                    }
                    if (!tag) {
                        resolve();
                    } else {
                        return questionnaireModel.findOneAndUpdate({tag: element[0], study: studyId}, questionnaire, function (err: any, updatedQuestionnaire: any) {
                            if (err) {
                                return cb(err);
                            }
                            if (updatedQuestionnaire) {
                                questionnaireData.push(updatedQuestionnaire);
                                resolve();
                            } else {
                                questionnaireModel.create({tag: element[0], task: element[1], study: studyId, createdBy: createdBy}, function (err: any, createdQuestionnaire: any) {
                                    if (err) {
                                        return cb(err);
                                    }
                                    questionnaireData.push(createdQuestionnaire);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            });
        });
        Promise.all(questionnaires).then(() => cb(undefined, questionnaireData));
    }
    public static count(cb: any, study: any) {
        questionnaireModel.count({study: study}).exec(cb);
    }
    public static delete(cb: any, studyId: any) {
        questionnaireModel.deleteMany({"study": studyId}, function (err: any) {
            if (err) {
                return cb(err);
            }
            // return cb(undefined, numAffected);
        });
    }
   public static async getQuestionnaire(studyId: any, questionnaireFields: any) {
       const questionnaireData = await questionnaireModel.find({study: studyId})
       .sort("tag")
       .lean()
       .exec();
       let element: any;
       const questionnaireObject: any[] = [];
        for (element in questionnaireData) {
            questionnaireData[element].texts = await QuestionnaireService.getQuestionnaireParticipantData(questionnaireData[element].texts);
        }
        return questionnaireData;
   }
   public static async getQuestionnaireParticipantData(textsArray: any) {
    return await questionnaireParticipantModel.find({ _id : {$in: textsArray}})
                .lean().exec();
    }

    public static addtagtext(cb: any, questionnaireId: any, participant: any, text: any, comment: any) {
        const questionnaireTag = {participant: participant, text: text, comment: comment};

        questionnaireParticipantModel.create(questionnaireTag, function (err: any, tag: any) {
            if (err) {
                return cb(err, undefined);
            }
            questionnaireModel.findById(questionnaireId, function (err: any, questionnaire: any) {
                if (err) {
                    return cb(err, undefined);
                }
                questionnaire.texts.push(tag);
                questionnaire.save((err: any, success: any) => {
                    if (err) {
                        return cb(err, undefined);
                    }
                });

                return cb(undefined, questionnaire);
            });
        });
    }
    public static addtagpost(cb: any, questionnaireId: any, post: any) {
        questionnaireModel.findById(questionnaireId, function (err: any, questionnaire: any) {
            if (err) {
                return cb(err, undefined);
            }
            if (questionnaire.posts.indexOf(post) == -1) {
                questionnaire.posts.push(post);
                questionnaire.save((err: any, success: any) => {
                    if (err) {
                        return cb(err, undefined);
                    }
                });
            }

            return cb(undefined, questionnaire);
        });
    }
    public static removetagpost(cb: any, questionnaireId: any, post: any) {
        questionnaireModel.findById(questionnaireId, function (err: any, questionnaire: any) {
            questionnaire.posts.remove(post);
            questionnaire.save((err: any, success: any ) => {
                if (err) {
                    return cb(err, undefined);
                }
                return cb(undefined, questionnaire);
            });
        });
    }
    public static removetagtext(cb: any, questionnaireId: any, participant: any, text: any, commentId: any) {
        questionnaireModel.findById(questionnaireId, function (err: any, questionnaire: any) {
            questionnaireParticipantModel.find({"comment": commentId})
            .exec((err: any, texts: any) => {
                const textsObj = texts.map( (text: any) => {
                    return new Promise((resolve) => {
                        if (questionnaire.texts.indexOf(text._id) != -1) {
                            questionnaire.texts.remove(text._id);
                            text.remove((err: any, success: any) => {
                                if (err) {
                                    return cb(err, undefined);
                                }
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    });
                });
                Promise.all(textsObj).then(() => {
                    questionnaire.save((err: any, success: any) => {
                        if (err) {
                            return cb(err, undefined);
                        }
                        cb(undefined, "success");
                    });
                });
            });
        });
    }
    public static async getQuestionnaireDataInArray(questionnairesArray: any) {
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<< getQuestionnaireDataInArray >>>>>>>>>>>>>>>>>>>>>>>")
        const startTime = Date.now();
        const questionnaireData = await questionnaireModel.find({ _id : {$in: questionnairesArray}})
                                    .sort("tag")
                                    .populate({path:"texts", model: "QuestionnaireParticipant"})
                                    .lean()
                                    .exec();
        console.log('Time Taken: ' + (Date.now()-startTime)/1000);
        return questionnaireData;
    }

    public static async getQuestionnaireData(query: any): Promise<any> {
        let questionnaireData = [];
        try {
            questionnaireData = await questionnaireModel.find(query)
            .sort("tag")
            .lean()
            .exec();
            let questionnaire: any;
            for (questionnaire of questionnaireData) {
                questionnaire.texts = await QuestionnaireService._getTaggedCommentData({ _id : {$in: questionnaire.texts}}, { path: "comment", select: "post", model: CommentModel });
                questionnaire.posts = await PostService.instance.getDistinctPostsArray(questionnaire.posts);
            }
        } catch (e) {
            return {error: true, message: "Invalid Study Id"};
        }
        return questionnaireData;
    }
    private static async _getTaggedCommentData(query: any, populationObj: any) {
        const data = await questionnaireParticipantModel.find(query).populate(populationObj).lean().exec();
        return data.filter(i => i.comment);
    }
    public static async getQuestionniareTagList (query): Promise<any> {
        let tags: any = [];
        try {
            tags = await questionnaireModel.find(query).lean().exec();
        } catch (e) {
            return {
                error: true,
                message: e.message
            }
        }
        return tags;
    }
    public static async getSearchedPresetTagsData (tagIds: any, study: any, participantIds: any, userIds: any): Promise<any> {
        let tags: any = [];
        try {
            tags = await questionnaireModel.find({_id: {$in: tagIds}, study: study})
            .populate({path:"texts", match: {participant: {$in: participantIds}}, model: "QuestionnaireParticipant", populate:{ path:"entity", populate: {path: "comment", model: "Comment", match: {createdBy: {$in: userIds}}}}})
            .lean()
            .exec();
            tags = QuestionnaireService._getTaggedPresetCommentDataByUsers(tags, userIds);
        } catch (e) {
            return {
                error: true,
                message: e.message
            }
        }
        return tags;
    }

    private static _getTaggedPresetCommentDataByUsers(tags: any, userIds: any) {
        tags = tags.map(questionnaire => {
            questionnaire.name = questionnaire.tag;
            questionnaire.texts = questionnaire.texts.filter(questionnaireParticipant => {
                if(questionnaireParticipant.entity) {
                    questionnaireParticipant.comment = Object.assign({}, questionnaireParticipant.entity);
                    if(questionnaireParticipant.onModel === "Comment" && userIds.indexOf(""+questionnaireParticipant.entity.createdBy) != -1) {
                        delete questionnaireParticipant.entity;
                        return true;
                    }
                    else if(questionnaireParticipant.onModel === "LocaleComment" && questionnaireParticipant.entity.comment) {
                        questionnaireParticipant.comment["createdBy"] = questionnaireParticipant.entity.comment.createdBy;
                        questionnaireParticipant.comment["post"] = questionnaireParticipant.entity.comment.post;
                        delete questionnaireParticipant.entity;
                        delete questionnaireParticipant.comment.comment;
                        return true;
                    }
                }
                return false;
            });
            return questionnaire;
        });
        
        return tags;
    }

}
export default QuestionnaireService;