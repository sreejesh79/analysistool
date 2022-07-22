import UserModel from "../models/user";
class UserService {

    private static _singleton: boolean = true;
    private static _instance: UserService;

    constructor() {
        if (UserService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use UserService.instance instead!");
        }
    }

    public static get instance(): UserService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new UserService();
            this._singleton = true;
        }
        return this._instance;
    }

    public async fetchUser (token: string) {
        let response: any = { error: true, body: "Invalid Token" };
        if (token != "") {
            const userData: any = await UserModel.findOne({ "token": token }).select("userType token").lean().exec();
            if (userData) {
                response = { error: false, body: userData };
            }
        }
        return response;
    }

    public async getUserStudyIds (userId: string): Promise<any> {
        let userStudies;
        try {
            userStudies = await UserModel.findOne({_id: userId}).select("studies").lean().exec();
        } catch (e) {
            return {error: true, message: "Invalid User"};
        }
        return userStudies.studies;
        
    }

    public async getUserOrganizations (userId: string): Promise<any> {
        let userOrganizations;
        try {
            // userOrganizations = UserModel.findOne()
        } catch (e) {

        }
    }

}

export default UserService;