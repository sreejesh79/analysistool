import questionnaireParticipantModel from "../models/questionnaire_participants";
import participantModel from "../models/participant";
import questionnaireModel from "../models/questionnaire";
import GroupModel from "../models/group";
import moment from "moment";
import UserType from "../../common/constants";
import fs from "fs";
import CommentModel from "../models/comment";
import PostService from "./postService";
import LocaleCommentModel from "../models/localecomment";
import Extras from "../../util/exras";

class VerbatimService {
    private static _singleton: boolean = true;
    private static _instance: VerbatimService;

    constructor() {
        if (VerbatimService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use VerbatimService.instance instead!");
        }
    }

    public static get instance(): VerbatimService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new VerbatimService();
            this._singleton = true;
        }
        return this._instance;
    }

    private static doNotUse() {
        // Do not use this function
        // This function is just to import LocaleCommentModel within the module so as to avoid below error:
        // Schema not registered for model
        CommentModel.find().lean().exec();
        LocaleCommentModel.find().lean().exec();
    }

    public async getStudyParticipants(studyId: string): Promise<any> {
        const participants = await participantModel.find({study: studyId})
        .populate({ path: "group", select: "name", model: GroupModel })
        .populate("user", "userType birthdate lastName firstName city")
        .lean()
        .exec();
        return participants;
    }

    public async getFilteredStudyParticipants(query: any, filter: any): Promise<any> {
        const participants = await participantModel.find(query)
        .populate({ path: "user", select: "userType birthdate lastName firstName city", match: {$or : filter} })
        .lean()
        .exec();
        return participants.filter(item => item.user);
    }

    public async getQuestionnaireData(query: any): Promise<any> {
        let questionnaireData = [];
        try {
            questionnaireData = await questionnaireModel.find(query)
            .sort("tag")
            .populate({path:"texts", model: "QuestionnaireParticipant", populate:{ path:"entity", populate: {path: "comment", model: "Comment", select: "post"}}})
            .populate({path: "posts", model: "Post", match: {isDeleted: false}, select: "_id"})
            .lean().exec();
            questionnaireData = this.parseQuestionnaireParticipantData(questionnaireData);
        } catch (e) {
            return {error: true, message: "Invalid Study Id"};
        }
        return questionnaireData;
    }

    private parseQuestionnaireParticipantData(questionnaireData) {
        questionnaireData = questionnaireData.map(questionnaire => {
            questionnaire.texts = questionnaire.texts.filter(questionnaireParticipant => {
                if(questionnaireParticipant.entity) {
                    questionnaireParticipant.comment = questionnaireParticipant.entity;
                    if(questionnaireParticipant.onModel === "Comment") {
                        delete questionnaireParticipant.entity;
                        return true;
                    }
                    else if(questionnaireParticipant.onModel === "LocaleComment" && questionnaireParticipant.entity.comment) {
                        questionnaireParticipant.comment["post"] = questionnaireParticipant.entity.comment.post;
                        delete questionnaireParticipant.entity;
                        // do not use below line as it cause circular reference issue
                        // rather implement alternative for below to avoid extra data in response
                        // delete questionnaireParticipant.comment.comment;
                        return true;
                    }
                }
                delete questionnaireParticipant.entity;
                return false;
            });
            questionnaire.posts = questionnaire.posts.map(post => post._id.toString()).filter(Extras.onlyUnique);
            return questionnaire;
        });
        
        return questionnaireData;
    }

    public async exportData(userType: string, participantData: any, questionnaireData: any, liveTagsData: any) {
        const dataArray = [];
        const participantIds = [];
        dataArray.push([
            {"text": "Tag", "style": [{"font_family": {"size": "16", "bold": "true"}}, {"align": "center"}, {"valign": "middle"}]},
            {"text": "Task", "style": [{"font_family": {"size": "16", "bold": "true"}}, {"align": "center"}, {"valign": "middle"}, {"width": "100"}]}
        ]);
        participantData = this._parseParticipantData(participantData, userType);
        let participant: any;
        for (participant of participantData) {
            if (participant.user.userType === UserType.PROSPECT) {
                participantIds.push(participant._id + "");
                const dataObj = {};
                dataObj["text"] = participant.name;
                dataObj["style"] = [{"font_family": {"size": "16", "bold": "true"}}, {"width": "25"}, {"align": "center"}];
                dataArray[0].push(dataObj);
            }
        }
        for (let i = 0; i < questionnaireData.length; i++) {
            dataArray.push(await this.parseQuestionnaireData(participantIds, questionnaireData[i], "tag"));
        }
        if (liveTagsData && liveTagsData.length > 0) {
            const liveTagsVerbatim = [];
            for (let i = 0; i < liveTagsData.length; i++) {
                liveTagsVerbatim.push(await this.parseQuestionnaireData(participantIds, liveTagsData[i], "name"));
            }
            // if (dataArray.length > 1) {
            //     const temp = [];
            //     temp.push({ "text": "" , "style": [{"font_family": {"size": "14"}}] });
            //     temp.push({ "text":  "" , "style": [{"font_family": {"size": "14"}}] });
            //     dataArray.push(temp);
            // }
            let d: any;
            for (d of liveTagsVerbatim) {
                dataArray.push(d);
            }
        }
        return dataArray;
    }

    _parseParticipantData(participantData, userType) {
        let participant;
        for ( participant of participantData) {
            let lastName = participant.user.lastName;
                const lNameFC = lastName.substr(0, 1);
                lastName = (userType == UserType.ADMIN ? lastName : lNameFC.toLocaleUpperCase());
                if (participant.user.birthdate) {
                    const date = moment(participant.user.birthdate);
                    participant.name = Extras.titleCase(participant.user.firstName + " " + lastName) + " - " + moment().diff(date, "years") + "\n" + Extras.titleCase(participant.user.city);
                } else {
                    participant.name = Extras.titleCase(participant.user.firstName + " " + lastName) + "\n" + Extras.titleCase(participant.user.city);
                }
        }
        return participantData.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    }
    private async parseQuestionnaireData (participantIds: any, questionnaireData: any, nameKey) {
        const questionnaireArr = [];
        questionnaireArr.push({ "text": questionnaireData[nameKey] , "style": [{"font_family": {"size": "14"}}] });
        questionnaireArr.push({ "text": questionnaireData.task || "" , "style": [{"font_family": {"size": "14"}}] });

        for (let i = 0; i < participantIds.length; i++) {
            const pid = participantIds[i];
            let qtext = "";
            for (let j = 0; j < questionnaireData.texts.length; j++) {
                const questionnaires = questionnaireData.texts[j];
                if (pid + "" === questionnaires.participant + "") {
                    qtext = qtext + questionnaires.text + "\n";
                }
            }
            questionnaireArr.push( {"text": qtext , "style": [{"font_family": {"size": "14"}}] });
        }

    return questionnaireArr;
    }
    public deleteFile(path: any) {
        fs.unlink(path, (err) => {
            if (err) throw err;
            console.log(path + " was deleted");
        });
    }
}
export default VerbatimService;