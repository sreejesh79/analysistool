import * as jwt from "jsonwebtoken";
import Auth from "../../config/auth";

class TokenService {
    public static decode(token: string){
        try {
            // jwt.verify throws exception if invalid signature or algorithm
            const verifyToken: any = jwt.verify(token, Auth.RSA_PUBLIC_KEY);
            const decoded: any = jwt.decode(token);
            return {
                error: false,
                decoded,
                isExpired: decoded.exp * 1000 <= Date.now()
            };
        } catch (e) {
            console.log(e.message);
        }
        return {
            error: true,
            message: "Invalid token",
        };
    }

}

export default TokenService;