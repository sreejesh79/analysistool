import RemotingClient from "../lib/remoting.client";
import UserModel from "../models/user";
import EventDispatcher from "../lib/events/eventdispatcher";
import CookieService from "../services/cookieservice";
import LookLookAtUtils from "../utils/looklook-at";
import moment from "moment";
import HttpService from "./httpservice";
let _singleton: boolean = true;
let _instance: MediaService;
const cookieSerice = CookieService.instance;
const _httpService = HttpService.instance;

class MediaService extends EventDispatcher {
    constructor(){
        super();
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use MediaService.instance instead!');
        }
    }
    static get GENERATE_SIGNED_URL () { return process.env.GET_MEDIA_SIGNED_URL;}

    static get instance(): MediaService{
        if (!_instance) {
            _singleton = false;
            _instance = new MediaService();
            _singleton = true;
        }
        return _instance;
    }
    
    async getStudyMedia(studyId: string, type: string, isNewStudy=false, skip, limit, filteredObject?=undefined) {
        const user: UserModel = cookieSerice.user;
        let data: any = {studyid:studyId, "token": user.token, type: type, isNewStudy:isNewStudy,skip:skip,limit:limit};
        if(skip == null && limit == null) {
            data = {studyid:studyId, "token": user.token, type: type, isNewStudy:isNewStudy};
        }
        if(filteredObject) {
           data = Object.assign(data, filteredObject);
        }

        let responsePostsData: any =  await RemotingClient.callServer("gallery.getStudyMedia", data, null);
        if(responsePostsData._error) {
            console.log(responsePostsData._body);
            return [];
        }
        return this.parsedStudyMediaData(responsePostsData._body, user.userType, isNewStudy);
    }

    parsedStudyMediaData (body, userType, isNewStudy){
        const postsData = [] ;
		for(let p of  body) {
            const _createdAtMom = moment(p.createdAt, [moment.ISO_8601]);
            let _image = p.imageUrl;
            const _video = p.videoUrl;
            const _mediaId = p.media ? p.media[0] : p._id;
            const _description = p.description;
            const _imageObjectKey = p.imageObjectKey;
            const _videoObjectKey = p.videoObjectKey;
            let postData;
            if(isNewStudy) {
                _image = p.image;
                _video = p.video;
                postData = Object.assign({}, p.post);
            } else {
                postData = Object.assign({}, p);
            }

            postData["createdAtMoment"] = _createdAtMom;
            postData["createdAt"] = postData.createdAtMoment.format("MM/DD/YYYY");
            postData["image"] = _image;
            postData["videoUrl"] = _video;
            postData["description"] = _description;
            postData["imageObjectKey"] = _imageObjectKey;
            postData["videoObjectKey"] = _videoObjectKey;
            postData["mediaId"] = _mediaId;
            /*if (!postData._id) {
                postData["_id"] = _id;
            }*/

            if(postData.user && postData.user.userType && postData.user.userType === "Prospect") {
                postData = LookLookAtUtils.getParticipantName(userType, postData);
                postsData.push(postData);
            }
        }
        return postsData.sort((a,b) => a.createdAtMoment.isBefore(b.createdAtMoment) ? -1 : a.createdAtMoment.isAfter(b.createdAtMoment) ? 1 : 0);
    }

    async getQuestionnairePostData(studyId: string, questinaireIds:string[]) {
        const user: UserModel = cookieSerice.user;
        let data = {studyid: studyId, "token": user.token};
        if(questinaireIds && questinaireIds.length) {
            data = Object.assign(data, {"tags":questinaireIds})
        }
        const reponseQuestionnaireData = await RemotingClient.callServer("gallery.getQuestionnairePostData", data, null);
        if(reponseQuestionnaireData._error) {
            return [];
        }
        return reponseQuestionnaireData._body.sort((a,b) => a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0);;
    }

    async updatePostDescription(postId: string, description: string, isMedia: boolean){
        const user: UserModel = cookieSerice.user;
        const data = {postid: postId, "token":user.token, description: description, isMedia};
        return await RemotingClient.callServer("gallery.updatePostDescription",data, null);
    }

    async getPostDataByIds(posts: any) {
        const user: UserModel = cookieSerice.user;
        const data = {posts: posts, "token":user.token};
        const resposne = await RemotingClient.callServer("gallery.getPostDataByIds", data, null);
        if(resposne._error) {
            console.log(resposne._body);
            return [];
        }
        return resposne._body;
    }

    async deleteMedia (study: string, post: string, type: string) {
        const user: UserModel = cookieSerice.user;
        const data = {study, post, type, "token":user.token};
        const resposne = await RemotingClient.callServer("gallery.deleteMedia", data, null);
        return resposne;
    }

    async generateSignedUrl(mediaId) {
        let resp;
        try {
            resp = await _httpService.generateSignedUrl(MediaService.GENERATE_SIGNED_URL, mediaId);
        }
        catch(e) {
            console.log("Error",e)
        }
        return resp ? resp.signedUrl : null;
    }
}
export default MediaService;