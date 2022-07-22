import SocketRequest from "../../lib/apiRequest";
import SocketResponse from "../../lib/apiResponse";
import TokenService from "../services/token.service";
import UserServiceExtended from "../services/userserviceextended";

class Token {

    public static async validateToken(req: SocketRequest, res: SocketResponse) {
        // return res.apiSuccess("Token is valid");
        // return res.apiError(response.body);
        const body: any = req.body;
        let token: string = "";
        if (body.hasOwnProperty("token")) {
            token = body.token;
            if (token) {
                const decodedRes = TokenService.decode(token.split(" ")[1]);
                console.log("decodedRes", decodedRes);

                if (!decodedRes.error){
                    if (decodedRes.isExpired) {
                        return res.apiError("Token is expired.");
                    }
                    // req.userId = decodedRes.decoded.userId;
                    const response: any = await UserServiceExtended.instance.getUserByToken(decodedRes.decoded.userId, "email firstName lastName userType pp_accepted");
                    if (response.error) {
                        return res.apiError(response);
                    } else {
                        req.socket["user"] = response.body;
                    }
                    return res.apiSuccess("Token is valid");
                }

                return res.apiError("Token is not valid.");

            }
        }
        return res.apiError("Api Key or Token not found");

    }

}

export default Token;