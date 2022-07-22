import RemotingClient from "../lib/remoting.client";
import UserModel from "../models/user";
import CookieService from "../services/cookieservice";
import EventDispatcher from "../lib/events/eventdispatcher";
let _singleton: boolean = true;
let _instance: TagService;
const cookieService = CookieService.instance
class TagService extends EventDispatcher {
    constructor() {
        super();
        if (_singleton) {
            throw new SyntaxError('This is a singleton class. Please use TagService.instance instead!');
        }
    }
    static get instance(): TagService {
        if(!_instance) {
            _singleton = false;
            _instance = new TagService();
            _singleton = true;
        }
        return _instance;
    }
    async getStudyTags(studyId: string, liveTags:string[]) { 
        const user: UserModel = cookieService.user;
        let data: any = {studyid:studyId, "token": user.token};
        if(liveTags && liveTags.length) {
            data = Object.assign(data, {'tags':liveTags})
        }
        const responseTagsData = await RemotingClient.callServer("tags.getStudyTags", data, null);
        if(responseTagsData._error) {
            // console.log(responseTagsData._body);
            return [];
        }
        return responseTagsData._body.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    }

    async getStudyTagsByUserType() {
        const user: UserModel = cookieService.user;
        const data: any = {token: user.token};
        const response = await RemotingClient.callServer("tags.getStudyTagsByUserType", data, null);
        if (response._error) {
            // console.log(response._body);
            return [];
        }
        return response._body.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);;
    }
}
export default TagService;