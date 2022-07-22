import ApiResponse from "../../lib/apiResponse";
import Logger from "../../util/logger";

class ApiAuthUser {

    public static async validateToken(ctx: any, next: any) {
        Logger.log("info", "Logger request initiated");
        const headers: any = ctx.headers;
        let token: string = "";
        const response: ApiResponse = new ApiResponse("Token.validate");
        token = headers.token;
        if (token == ctx.req.user.token) {
            console.log("Token is valid");
            return await next();
        }
        return ctx.body = response.apiError("Invalid Token");
    }
}

export default ApiAuthUser;