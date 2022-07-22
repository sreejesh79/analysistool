import RemotingClient from "../lib/remoting.client";
import UserModel from "../models/user";
import AuthServerService from './auth-server.service';

let _singleton: boolean = true;
let _instance: AuthService;

class AuthService {

    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use AuthService.instance instead!');
        }
    }

    static get instance(): AuthService{
        if (!_instance) {
            _singleton = false;
            _instance = new AuthService();
            _singleton = true;
        }
        return _instance;
    }

    async login(username: string, password: string) {
        let userdata = {"email": username, "password": password};
        return await AuthServerService.login(userdata);
    }

    async logout() {
        return null; // await RemotingClient.callServer("auth.logout", null, null);
    }

    async validateToken(user: UserModel) {
        return await RemotingClient.callServer("user.privacypolicy", {_id: user._id, token: AuthServerService.token}, null);
    }

    async validateTokenString(token: string) {
        return await RemotingClient.callServer("user.privacypolicy", {token}, null);
    }

    async acceptPrivacyPolicy(email) {
        let userdata = {"email": email};
        return  RemotingClient.callServer("auth.acceptPrivacyPolicy", userdata, UserModel);
    }
}

export default AuthService;