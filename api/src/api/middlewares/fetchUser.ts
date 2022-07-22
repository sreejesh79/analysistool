import SocketRequest from "../../lib/apiRequest";
import SocketResponse from "../../lib/apiResponse";
import UserService from "../services/userService";

class FetchUser {

    public static async get(req: SocketRequest, res: SocketResponse) {
        if ((!req.socket.hasOwnProperty("user"))) { // || (req.socket && req.socket.user && req.body.token && req.body.token != req.socket.user.token)) {
            const body: any = req.body;
            console.log(body);
            const response: any = await UserService.instance.fetchUser(body.token);
            if (response.error) {
                console.log("response.body", response.body);
                return res.apiError(response.body);
            } else {
                req.socket["user"] = response.body;
            }
        }
        return res.apiSuccess("Token is valid");
    }

}

export default FetchUser;