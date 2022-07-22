import EventDispatcher from "../lib/events/eventdispatcher";
import UserModel from "../models/user";
import CookieService from "../services/cookieservice";
import RemotingClient from "../lib/remoting.client";
let _singleton: boolean = true;
let _instance: SessionService;
class GroupService extends EventDispatcher {
    constructor(){
        super();
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use GroupService.instance instead!');
        }        
    }

    static get instance(): GroupService{
        if (!_instance) {
            _singleton = false;
            _instance = new GroupService();
            _singleton = true;
        }
        return _instance;
    }
    
    async getStudyGroups(studyid: string) {
        const user: UserModel = CookieService.instance.user;
        let request: any = {studyid:studyid, "token": user.token};
        const responseGroupNames = await RemotingClient.callServer("group.getStudyGroups", request, null);
        if(responseGroupNames._error) {
            console.log(responseGroupNames._body);
            return [];
        }
        return responseGroupNames._body.sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    }
}
export default GroupService;