import * as jwt from "jwt-simple";
import UserModel from "../models/user";
import bcrypt = require("bcrypt");
import Secret from "../../config/secret";
import UserService from "../services/userService";
import ApiRequest from "../../lib/apiRequest";
import UserType from '../../common/constants';

class AuthService {

    private static _singleton: boolean = true;
    private static _instance: AuthService;

    constructor() {
        if (AuthService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use AuthService.instance instead!");
        }
    }

    public static get instance(): AuthService {
        if (!this._instance) {
            this._singleton = false;
            this._instance = new AuthService();
            this._singleton = true;
        }
        return this._instance;
    }

    public  async login(username: string, password: string): Promise<any> {
        console.log("checking login");
            let response: any = { error: true, body: "Username or Password does not match" };

            let userData: any = {};
            userData =  await UserModel.findOne({email: username})
                .select("firstName lastName email token userType password pp_accepted")
                .lean()
                .exec();

            if (userData) {
                if(userData.userType === "Prospect"){
                    response['body'] = 'You are not Authorized user';
                    return response;
                }
                if (await this.checkUser(password, userData.password)) {
                    delete userData.password;
                    const updatedToken: string = this.setupToken(userData);
                    const updatedData: any = await UserModel.findByIdAndUpdate(userData._id, {token: updatedToken});
                    console.log("userData: ", userData);
                    response = {
                        error: false,
                        body: userData
                    };
                }
            }
            return response;
    }

    public async validateToken(token: any, req: ApiRequest): Promise<any> {
        let response: any = { error: true, body: "Invalid Token" };
        let tokenData: any = "";
        if (token) {
            tokenData = await UserModel.findOne({"token": token}).select("email firstName lastName token userType").lean().exec();
            if (tokenData) {
                response = { error: false, body: tokenData };
            }
        }
        return response;
    }

    private  async checkUser(password: string, hashPassword: string): Promise<any> {
        const match: boolean = await bcrypt.compare(password, hashPassword);
        return match;
    }

    private setupToken(user: any): string {
        const secret: Secret = new Secret();
        const tokenData: any = secret.getToken(user);
        let updatedToken: string = "";
        if (user.token) {
            try {
                const decoded: any = jwt.decode(user.token, secret.tokenKey());
                console.log(decoded, (decoded.exp - Date.now()));
                if (decoded.exp <= Date.now()) {
                    updatedToken = tokenData.token;
                } else {
                    updatedToken = user.token;
                }
            } catch (e) {
                updatedToken = tokenData.token;
            }
        } else {
            updatedToken = tokenData.token;
        }
        return updatedToken;
    }

    public async acceptPrivacyPolicy(email: string) {
        let response: any;
        try {
            const res = await UserModel.findOneAndUpdate({"email": email}, {pp_accepted: true}, {new: true}).select("email firstName lastName token userType").lean().exec();
            console.log("response: ", res);
            response = {error: false, body: res};
        } catch (e) {
            response = {error: true, message: "Invalid Email Id"};
        }
        return response;
    }

}

export default AuthService;