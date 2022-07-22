import MediaController from "../media";
class ImageController extends MediaController {
    
    async getImageData(filterData = undefined, studyId: string, isNewStudy = false, skip, limit) {
        return await this.getPostData(filterData, studyId, "image", isNewStudy, skip, limit)
    }    
    
}
export default ImageController;