import UserModel from "../models/user";
import moment from "moment";
import UserType from "../../common/constants";


class UserServiceExtended {

    private static _singleton: boolean = true;
    private static _instance: UserServiceExtended;
    constructor() {
        if (UserServiceExtended._singleton) {
            throw new SyntaxError("This is a singleton class. Please use UserServiceExtended.instance instead!");
        }
    }

    public static get instance(): UserServiceExtended {
        if (!this._instance) {
            this._singleton = false;
            this._instance = new UserServiceExtended();
            this._singleton = true;
        }
        return this._instance;
    }

    
    public async getUserByToken(user: string, select: string = ""): Promise<any> {
        let response: any;
        try {
            let q =  UserModel.findOne({ _id: user })
            if (select.length > 0){
                q = q.select(select);
            }
            response = await q.lean().exec();
            if (!response) {
                return {
                    error: true,
                    body: "Invalid user id"
                };
            }
        } catch (e) {
            return {
                error: true,
                message: e.message
            };
        }
        return {
            error: false,
            body: response
        };
    }
}

export default UserServiceExtended;