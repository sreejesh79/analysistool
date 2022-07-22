import RemotingClient from "../lib/remoting.client";
import StudyModel from "../models/study";
import UserModel from "../models/user";
import CookieService from "../services/cookieservice";
import EventDispatcher from "../lib/events/eventdispatcher";

let _singleton: boolean = true;
let _instance: VerbatimService;

class VerbatimService extends EventDispatcher{
    
    constructor(){
        super();
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use VerbatimService.instance instead!');
        }        
    }

    static get instance(): VerbatimService{
        if (!_instance) {
            _singleton = false;
            _instance = new VerbatimService();
            _singleton = true;
        }
        return _instance;
    }
    
    async getStudyName(studyid: string) {
        const user: UserModel = CookieService.instance.user;
        let data: any = {studyid:studyid, "token": user.token};
        return await RemotingClient.callServer("study.getStudyName", data, null);
    }

    async getStudyQuestionnaireVerbatim(studyid: string) {
        const user: UserModel = CookieService.instance.user;
        let data: any = {studyid:studyid, "token": user.token};
        const questionnaireData = await RemotingClient.callServer("gallery.getQuestionnaireVerbatim", data, null);
        if(questionnaireData._error) {
            //console.log(questionnaireData._body);
            return [];
        }
        return questionnaireData._body.sort((a, b) => a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0);
    }

    async getFilteredVerbatimData(filter: string) {
        const user: UserModel = CookieService.instance.user;
        let data: any = {filter:filter, "token": user.token};
        return await RemotingClient.callServer("gallery.getFilteredVerbatimData", data, null);
    }

    async getVerbatimDataByIds(request) {
        const user: UserModel = CookieService.instance.user;
        let data: any = {studyid: request.study, userid: request.userId, tags: request.tagsData, "token": user.token};
        const response = await RemotingClient.callServer("gallery.getTagsDataByIds", data, null);
        if(response._error) {
            //console.log(response._body);
            return [];
        }
        return response._body;
    }
}

export default VerbatimService;