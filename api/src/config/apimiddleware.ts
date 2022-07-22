import ApiAuthUser from "../api/middlewares/apiAuthUser";
import ApiFetchUser from "../api/middlewares/apiFetchUser";
import Handshake from "../api/middlewares/apiHandshake";
class ApiMiddleware {

    public static routes(router: any): void {
        // router.all("/api/*", ApiFetchUser.get, ApiAuthUser.validateToken);
        router.all("/api/*", Handshake.verify); // Handshake
    }
}

export default ApiMiddleware;