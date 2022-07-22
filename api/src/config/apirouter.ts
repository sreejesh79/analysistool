import Home from "../api/controllers/home";
import Gallery from "../api/controllers/gallery";
import File from "../api/controllers/file";
class ApiRouter {
    public static routes(router: any): void {
        router.get("/api/*", Home.get);
        router.get("/file/:filename", File.getFile);
    }
}
export default ApiRouter;