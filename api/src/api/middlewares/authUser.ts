import SocketRequest from "../../lib/apiRequest";
import SocketResponse from "../../lib/apiResponse";

class AuthUser {

    public static async validateToken(req: SocketRequest, res: SocketResponse) {
        const body: any = req.body;
        let token: string = "";
        if (body.hasOwnProperty("token")) {
            token = body.token;
            if (token === req.socket.user.token) {
                return res.apiSuccess("Token is valid");
            }
        }

        return res.apiError("Invalid Token");
    }

}

export default AuthUser;