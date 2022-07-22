import UserModel from "../models/user";
import CookieService from "../services/cookieservice";
import RemotingClient from "../lib/remoting.client";
let _singleton: boolean = true;
let _instance: DownloadService;
class DownloadService {
    constructor() {
        if(_singleton) {
            return new SyntaxError('This is a singleton class. Please use DownloadService.instance instead!');
        }
    }
    static get instance(): DownloadService {
        if(!_instance) {
            _singleton = false;
            _instance = new DownloadService();
            _singleton = true;
        }
        return _instance;
    }
    async createDownloadableExcelFile(obj: any) {
        const user: UserModel = CookieService.instance.user;
        let request: any = {verbatims:obj, "token": user.token};
        const responseFilename = await RemotingClient.callServer("gallery.downloadVerbatim", request, null);
        if(responseFilename._error) {
            console.log(responseFilename._error);
        }
        return responseFilename._body;
    }
    async downlaodPosts(type, postIds: any, studyId: string) {
        const user: UserModel = CookieService.instance.user;
        let request: any = {type: type, postIds: postIds, studyId: studyId, "token": user.token};
        let responseFilename;
        if(postIds.length) {
            responseFilename = await RemotingClient.callServer("gallery.downloadPosts", request, null);
        }
        else {
            responseFilename = await RemotingClient.callServer("download.allMedia", request, null);
        }
        
        if(responseFilename._error) {
            console.log(responseFilename._error);
        }
        return responseFilename._body;
    }
    async createDownloadableSearchResultExcelFile(obj: any) {
        const user: UserModel = CookieService.instance.user;
        let request: any = {search:obj, "token": user.token};
        const responseFilename = await RemotingClient.callServer("search.downloadSearchResults", request, null);
        if(responseFilename._error) {
            console.log(responseFilename._error);
        }
        return responseFilename._body;
    }
}
export default DownloadService;