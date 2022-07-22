import cookie from 'react-cookies';
import axios from "axios";
import RemotingClient from "../lib/remoting.client";

const USER_COOKIE_PATH: string = "/";

import Settings  from "../config/settings";
let _singleton = true;
let _instance;

class AuthServerService{
    accessToken = '';
    refreshToken;
    cookies;
    refreshingToken = false;
    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use AuthServerService.instance instead!');
        }
    }

    static get LOGIN () { return "/auth/login" };
    static get REFRESH_TOKEN () { return "/auth/refresh-token" };
    static get USER_PRIVACY () { return "/user/privacy" };
    
    get token(){
        return this.accessToken;
    }
    get refresh_token(){
        return cookie.load('refreshToken');
    }
    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new AuthServerService();
            _singleton = true;
        }
        return _instance;
    }

    async init(){ 
        if(this.token === ""){
            const token = cookie.load('refreshToken');
            return await this.updateRefreshToken(token, true);
        }
        return this.token;
    }

    wait = async (ms) => {
        let count = 0;
        return new Promise((r, j)=>setInterval(() => {
            ++count
            if(this.token !== "" || count>50){
                r();
            }
        }, ms))
    };

    clearCookie(){ 
        cookie.remove('refreshToken',{ path: USER_COOKIE_PATH})
    }
    async login (userdata) {
        // let userdata = {email, password};
        this.clearCookie();
        try {
            const response = await axios.post( Settings.API_AUTH_BASE_URL + AuthServerService.LOGIN, userdata,{ headers: { "Content-Type" : "application/json; charset=utf-8"}});
            console.log("response", response.data, response.data.data, response.data.data.error);
            if(response.status === 200 && response.data  && response.data.data && response.data.data.error){
                return {_error: true, _body:"Incorrect username or password."};
            }
            this.updateToken(response);
            return await this.getUserPrivacy();
        } catch (error) {
            console.log("Login Error ",error);
            return error;
        }
        
    }


    async refreshAccessToken() {
        const token = cookie.load('refreshToken');
        return await this.updateRefreshToken(token);
    }

    async updateRefreshToken(token, booCallUser = false) {
        if(token && !this.refreshingToken){
            this.refreshingToken = true;
            try {
                let response = await axios.post(Settings.API_AUTH_BASE_URL + AuthServerService.REFRESH_TOKEN, {}, {headers: {'x-access-token': token}, "Content-Type":"application/json"});
                console.log(response);
                this.updateToken(response);
                this.refreshingToken = false;
                if(booCallUser){
                    response = await this.getUserPrivacy();
                    console.log("updateRefreshToken",response);
                }
                return response;
            } catch (error) {
                // this.clearCookie();
                if(error.response && error.response.status === 401){
                    // window.location.reload();
                }
                if(error.response && error.response.status === 404){
                    // window.location.href = '/login';
                }
            }
            this.refreshingToken = false;
        
        } else if(!token && window.location.pathname !== '/login'){
            window.location.href = '/login';
        }
        return null;
    }

    async getUserPrivacy() {
        try {
            return await RemotingClient.callServer("user.privacypolicy", {token: this.token}, null);
        } catch (error) {
            if(error.response && error.response.status === 401){
                // window.location.reload();
            }
            console.log(error);
        }
        return null;
    }

    updateToken(response){
        console.log(response)
        if(response.status === 200){
            this.accessToken = "Bearer " + response.data.data.accessToken;
            cookie.save('refreshToken', response.data.data.refreshToken, { path: USER_COOKIE_PATH})
        }
    }
             

}
export default AuthServerService.instance;