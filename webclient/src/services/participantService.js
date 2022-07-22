import RemotingClient from "../lib/remoting.client";
import UserModel from "../models/user";
import EventDispatcher from "../lib/events/eventdispatcher";
import CookieService from "../services/cookieservice";
import LookLookAtUtils from "../utils/looklook-at";
import moment from "moment";

let _singleton: boolean = true;
let _instance: ParticipantService;
const cookieSerice = CookieService.instance;
class ParticipantService extends EventDispatcher {
    constructor(){
        super();
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use ParticipantService.instance instead!');
        }
    }

    static get instance(): ParticipantService {
        if (!_instance) {
            _singleton = false;
            _instance = new ParticipantService();
            _singleton = true;
        }
        return _instance;
    }
    async getStudyParticipants(studyid: string, participantIds=null) {
        const user: UserModel = CookieService.instance.user;
        let data: any = {studyid:studyid, "token": user.token};
        if(participantIds) {
            data = Object.assign(data, {'participants': participantIds});
        }
        const responseParticipantData = await RemotingClient.callServer("gallery.getParticipants", data, null);
        if(responseParticipantData._error) {
            // console.log(responseParticipantData._body);
            return [];
        }
        return this._parsedParticipantsData(responseParticipantData._body, user.userType);
    }

    _parsedParticipantsData (body, userType){
        const participantData = [] ;
		for(let p of body){
			if(p.user && p.user.userType && p.user.userType === "Prospect") {
				p = LookLookAtUtils.getParticipantName(userType, p);
				participantData.push(p)
			}
		}
        return participantData.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    }
    
}
export default ParticipantService;