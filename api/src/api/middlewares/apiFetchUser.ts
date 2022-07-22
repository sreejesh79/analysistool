import UserService from "../services/userService";
import ApiResponse from "../../lib/apiResponse";
class ApiFetchUser {

    public static async get(ctx: any, next: any) {
        if (!ctx.req.user) {
            const headers = ctx.headers;
            const res: ApiResponse = new ApiResponse("User.fetch");
            if (headers.token) {
                const response: any = await UserService.instance.fetchUser(headers.token);
                if (response.error) {
                    console.log(response.body);
                    return ctx.body = res.apiError(response.body);
                } else {
                    ctx.req.user = response.body;
                }
            } else {
                return ctx.body = res.apiError("Token not found");
            }
        }
        return await next();
    }

}

export default ApiFetchUser;