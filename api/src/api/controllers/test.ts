import User from "../vo/user";
import UserModel from "../models/user";
class Test {
    public static async getResponse(data: any): Promise<any> {
        console.log("getresponse");
        const user: User = new User();
        user.firstName = "Sreejesh";
        user.lastName = "Pillai";
        user.email = "sreejesh.pillai@focalworks.in";
        return new Promise( resolve => {
            UserModel.find({}, "firstName")
            .lean()
            .exec(function (err, users) {
                resolve(users);
            });
        });
        // return user;
    }
}

export default Test;