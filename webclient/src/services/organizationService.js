import RemotingClient from "../lib/remoting.client";
import UserModel from "../models/user";
import EventDispatcher from "../lib/events/eventdispatcher";
import CookieService from "../services/cookieservice";
import LookLookAtUtils from "../utils/looklook-at";

import moment from "moment";
let _singleton: boolean = true;
let _instance: OrganizationService;
const cookieSerice = CookieService.instance;
class OrganizationService extends EventDispatcher {
    constructor(){
        super();
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use OrganizationService.instance instead!');
        }
    }

    static get instance(): OrganizationService {
        if (!_instance) {
            _singleton = false;
            _instance = new OrganizationService();
            _singleton = true;
        }
        return _instance;
    }
    async getOrganizations() {
        const user: UserModel = CookieService.instance.user;
        let data: any = { "token": user.token};
        const responseOrganizationData = await RemotingClient.callServer("organization.getOrganizationList", data, null);
        // const responseOrganizationData = await RemotingClient.callServer("organization.get", data, null);    //ashish
        if(responseOrganizationData._error) {
            console.log(responseOrganizationData._body);
            return [];
        }
        return responseOrganizationData._body.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    }
    
}
export default OrganizationService;