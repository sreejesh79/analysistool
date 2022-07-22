import RemotingClient from "../../../../lib/remoting.client"
import StudyModel from "../../../../models/study"
import UserModel from "../../../../models/user"
import CookieService from "../../../../services/cookieservice"
class GalleryHeader {
    constructor () {}
    async getStudyName (studyId: string) {
        const user: UserModel = CookieService.instance.user;
        let study = {studyid: studyId, "token": user.token};
        let studyNameResponse = await RemotingClient.callServer("study.getStudyName", study, null);
        return studyNameResponse;
    }
}
export default GalleryHeader;