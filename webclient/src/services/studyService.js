import RemotingClient from "../lib/remoting.client";
import StudyModel from "../models/study";
import UserModel from "../models/user";
import CookieService from "../services/cookieservice";
import EventDispatcher from "../lib/events/eventdispatcher";

let _singleton: boolean = true;
let _instance: StudyService;

class StudyService extends EventDispatcher{
    STUDY_DATA: string = 'study_data';

    constructor(){
        super();
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use StudyService.instance instead!');
        }        
    }

    static get instance(): StudyService{
        if (!_instance) {
            _singleton = false;
            _instance = new StudyService();
            _singleton = true;
        }
        return _instance;
    }
    
    async get(studyType: string, skip?: number) {
        const user: UserModel = CookieService.instance.user;
        let data: any = {};
        if(skip){
            data = { "filter": studyType, "skip": skip, "token": user.token };
        } else {
            data = { "filter": studyType, "token": user.token }
        }
        return await RemotingClient.callServer("study.get", data, null, true);
    }

    async getStudyInfo(studyId) {
        const user: UserModel = CookieService.instance.user;
        let data: any = {"token": user.token, "studyid": studyId};
        const responseStudyData =  await RemotingClient.callServer("study.getStudyInfo", data, null);
        if(responseStudyData._error) {
            return [];
        }
        return responseStudyData._body;
    }

    async getStudyList() {
        const user: UserModel = CookieService.instance.user;
        let data: any = {"token": user.token};
        const responseStudiesData =  await RemotingClient.callServer("study.getStudyList", data, null);
        if(responseStudiesData._error) {
            console.log(responseStudiesData._body);
            return [];
        }
        return responseStudiesData._body.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    }

    async searchStudies (searchText, study, studyTags) {
        const user: UserModel = CookieService.instance.user;
        let data: any = {"token": user.token, searchText, study, tagIds: studyTags};
        const response = await RemotingClient.callServer("search.searchKeywords", data, null);
        if(response._error) {
            console.log(response._body);
            return {participants: [], posts : [], comments: []};
        }
        return response._body;
    }

    async handleStudySearch (searchText, studyIds, studyTags, allTags) {
        let response = {participants: [], posts : [], comments: [], tagComments: []};
        for (let study of studyIds) {
            const tagIds = [];
            for(let tag of allTags){
                if(tag.study === study && studyTags.indexOf(tag._id) !=-1){
                    tagIds.push(tag._id);
                }
            }
            const res = await this.searchStudies(searchText, study, tagIds);
            if (res.comments.length || res.tagComments.length) {
                response.comments = response.comments.concat(res.comments);
                response.posts = response.posts.concat(res.posts);
                response.participants = response.participants.concat(res.participants);
                response.tagComments = response.tagComments.concat(res.tagComments);
            }
        }
        return response;
    }

}

export default StudyService;