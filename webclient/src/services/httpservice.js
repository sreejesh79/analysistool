
import {React} from 'react';
import EventDispatcher from "../lib/events/eventdispatcher";
import CookieService from "./cookieservice";
import $ from 'jquery';

let _singleton: boolean = true;
let _instance: HttpService;
const _url = "http://localhost:3000/api"
class HttpService extends EventDispatcher{
    

    constructor(){
        super();
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use StudyService.instance instead!');
        }        
    }

    static get instance(): HttpService{
        if (!_instance) {
            _singleton = false;
            _instance = new HttpService();
            _singleton = true;
        }
        return _instance;
    }
    
    async get(path: string, needToken:boolean = true) {
        const user: UserModel = CookieService.instance.user;
        let options = {
            url: `${_url}/${path}`,
            type: "GET"
          }
          if(needToken){
            options.beforeSend= function( xhr ) {
                xhr.setRequestHeader("authorization",user.token);
            }
          }
        return await $.ajax(options);
    }

    async post(path: string, data:any = {}) {
        const user: UserModel = CookieService.instance.user;
        let options = {
            url: `${_url}/${path}`,
            type: "POST",
            beforeSend:function( xhr ) {
                xhr.setRequestHeader("authorization",user.token);
            },
            data:data
          }
        return await $.ajax(options).then(res=>{
            if(res.error_code===0) return res.data;
            return res.error;
        });
    }

    async generateSignedUrl(url, mediaId) {
        const user: UserModel = CookieService.instance.user;
        let options = {
            url: `${url}`,
            type: "GET"
          }
         
        options.beforeSend = function( xhr ) {
            xhr.setRequestHeader("authorization",user.token);
            xhr.setRequestHeader("object-key", mediaId);
        }
        return await $.ajax(options);
    }

}

export default HttpService;