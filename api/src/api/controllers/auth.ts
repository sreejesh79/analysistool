import AuthService from "../services/authService";
import ApiRequest from "../../lib/apiRequest";
import ApiResponse from "../../lib/apiResponse";

class Auth {

    public static async login(req: ApiRequest, res: ApiResponse): Promise<any> {
        const body: any = req.body;
        const username: string = body.username;
        const password: string = body.password;
        const response: any =  await AuthService.instance.login(username, password);
        if (response.error) {
            return res.apiError(response.body);
        } else {
            return res.apiSuccess(response.body);
        }
    }

    public static logout(req: ApiRequest, res: ApiResponse) {
        try {
            delete req.socket.user;
        } catch (e) {
            return res.apiError("Logout failed");
        }

        return res.apiSuccess("Successfully Logged Out");
    }

    public static async acceptPrivacyPolicy(req: ApiRequest, res: ApiResponse): Promise<any> {
        console.log("request body: ", req.body);
        const response: any = await AuthService.instance.acceptPrivacyPolicy(req.body.email);
        if (response.error) {
            return res.apiError(response.message);
        } else {
            return res.apiSuccess(response.body);
        }
    }

    public static async token(req: ApiRequest, res: ApiResponse): Promise<any> {
        const body: any = req.body;
        const response: any = await AuthService.instance.validateToken(body.token, req);
        if (response.error) {
            return res.apiError(response.message);
        } else {
            return res.apiSuccess(response.body);
        }
    }
}

export default Auth;