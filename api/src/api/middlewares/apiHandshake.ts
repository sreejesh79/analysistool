import ApiRequest from "../../lib/apiRequest";
import ApiResponse from "../../lib/apiResponse";
class Handshake {
    public static async verify(ctx: any, next: any) {
        const headers: any = ctx.headers;
        const response: ApiResponse = new ApiResponse("Handshake.verify");
        if (!headers.hs_token) {
            return ctx.body = response.apiError("Handshake token not found");
        }
        const serverHandshake = process.env.HANDSHAKE;
        const clientHandshake = headers.hs_token;
        if (serverHandshake == clientHandshake) {
            console.log("Hand shake verified successfully");
            return await next();
        } else {
            return ctx.body = response.apiError("Invalid hand shake");
        }
    }
}
export default Handshake;