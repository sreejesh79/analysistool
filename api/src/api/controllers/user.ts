import ApiRequest from "../../lib/apiRequest";
import ApiResponse from "../../lib/apiResponse";
import UserServiceExtended from "../services/userserviceextended";

class User {

    public static async privacypolicy(req: ApiRequest, res: ApiResponse): Promise<any> {
        // const body: any = req.body;
        const userId = req.socket.user._id;
        console.log("privacypolicy", userId);
        const response: any =  await UserServiceExtended.instance.getUserByToken(userId, "email firstName lastName userType pp_accepted");
        if (response.error) {
            return res.apiError(response.message);
        } else {
            return res.apiSuccess(response.body);
        }
    }

}

export default User;