import RemotingClient from "../lib/remoting.client";
import UserModel from "../models/user";
import CookieService from "../services/cookieservice";
import EventDispatcher from "../lib/events/eventdispatcher";
let _singleton = true;
let _instance;
const cookieService = CookieService.instance
class QuestionnaireService extends EventDispatcher {
    constructor() {
        super();
        if (_singleton) {
            throw new SyntaxError('This is a singleton class. Please use QuestionnaireService.instance instead!');
        }
    }
    static get instance() {
        if(!_instance) {
            _singleton = false;
            _instance = new QuestionnaireService();
            _singleton = true;
        }
        return _instance;
    }

    async getPresetStudyTagsByUserType() {
        const user = cookieService.user;
        const data = {token: user.token};
        const response = await RemotingClient.callServer("questionnaire.getPresetStudyTagsByUserType", data, null);
        if (response._error) {
            // console.log(response._body);
            return [];
        }
        const presetTags = response._body.map(t=>{
            t.name = t.tag;
            return t;
        }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
        return presetTags;
    }
}
export default QuestionnaireService;