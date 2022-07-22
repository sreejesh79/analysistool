import ApiRequest from "../../lib/apiRequest";
import ApiResponse from "../../lib/apiResponse";
import StudyService from "../services/studyService";
import PostService from "../services/postService";
import ArchiverService from "../services/archiverService";

class Download {

    public static async all(req: any, next: any): Promise<any> {

        const {studyId, type } = req.params;
        const studyName = await StudyService.instance.getStudyNameById(studyId);
        if (studyName.error) {
            return req.body = studyName.message;
            // return res.apiError(studyName.message);
        }

        let urls = [];
        let mediaObjectKeys = [];
        const postIds = await PostService.instance.getDistinctPostsByStudyId(studyId);

        if (studyName.isNewStudy) {
            const mediaType = type == "image" ? "image" : "video";
            urls = await PostService.instance.getDistinctMediaArray(postIds, mediaType);
            /*const response = await PostService.instance.getDistinctMediaArray(postIds, mediaType);
            urls = response.urls;
            mediaObjectKeys = response.mediaObjectKeys;*/
        } else {
            const mediaType = type == "image" ? "imageUrl" : "videoUrl";
            urls = await PostService.instance.getDistinctPostsMediaArray(postIds, mediaType);
        }
        const filename = await ArchiverService.instance.createZip(studyName.name, urls);
        return req.body = {studyId, type, studyName, postIds, urls , filename: "/file/" + filename};
        // return res.apiSuccess({"filename": "/file/" + filename});
    }
    public static async allMedia(req: ApiRequest, res: ApiResponse): Promise<any> {

        const {studyId, type } = req.body;
        const studyName =  await StudyService.instance.getStudyNameById(studyId);
        if (studyName.error) {
            return res.apiError(studyName.message);
        }

        let urls = [];
        let mediaObjectKeys = [];
        const postIds = await PostService.instance.getDistinctPostsByStudyId(studyId);

        if (studyName.isNewStudy) {
            const mediaType = type == "image" ? "image" : "video";
            urls = await PostService.instance.getDistinctMediaArray(postIds, mediaType);
            /*urls = response.urls;
            mediaObjectKeys = response.mediaObjectKeys;*/
        } else {
            const mediaType = type == "image" ? "imageUrl" : "videoUrl";
            urls = await PostService.instance.getDistinctPostsMediaArray(postIds, mediaType);
        }
        const filename = await ArchiverService.instance.createZip(studyName.name, urls);
        // return req.body = {studyId, type, studyName, postIds, urls , filename: "/file/" + filename};
        return res.apiSuccess({"filename": "/file/" + filename});
    }
}

export default Download;