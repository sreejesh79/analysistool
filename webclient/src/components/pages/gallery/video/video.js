import MediaController from "../media";
import Utils from "../../../../utils/utilityScript";
class VideoController extends MediaController {
    
    async getVideoData(filterData = undefined, studyId: string, isNewStudy = false, skip, limit) {
        return await this.getPostData(filterData, studyId, "video", isNewStudy, skip, limit)
    }
    
    
}
export default VideoController;