import ApiResponse from "../../lib/apiResponse";
import ApiRequest from "../../lib/apiRequest";
import TagService from "../services/tagService";
import UserType from "../../common/constants";
import StudyService from "../services/studyService";
import UserService from "../services/userService";
const tagSerice: TagService = TagService.instance;
export default class Tags {
    public static async getStudyTags(req: ApiRequest, res: ApiResponse) {
        console.log("<<<<<<<<<<<<<<<<<<<< getStudyTags >>>>>>>>>>>>>>>>>>>>>>>>");
        const startTime = Date.now();
        const body = req.body;
        const query = {study: body.studyid};
        if (body.tags && body.tags.length > 0) {
            query["_id"] = { $in: body.tags };
        }
        if (body.posts && body.posts.length > 0) {
            query["posts"] = { $in: body.posts };
        }
        const response = await tagSerice.getTagData(query);
        console.log('Time Taken: ' + (Date.now()-startTime)/1000);
        if (response.error) {
            return res.apiError(response.message);
        }
        return res.apiSuccess(response);
    }

    public static async getStudyTagsByUserType(req: ApiRequest, res: ApiResponse) {
        const user: any = req.socket.user;
        let studyTags: any = [];
        if(user.userType == UserType.ADMIN) {
            studyTags = await TagService.instance.getTagList({isDeleted: false});
        } else if (user.userType == UserType.MODERATOR || user.userType == UserType.CLIENT) {
                const userStudies = await UserService.instance.getUserStudyIds(user._id);
                if(userStudies.error) {
                    return res.apiError(userStudies.message);
                }
                studyTags = await TagService.instance.getTagList({study: {$in: userStudies}, isDeleted: false});
        }
        if(studyTags.error) {
            return res.apiError(studyTags.message);
        }
        return res.apiSuccess(studyTags);
    }
}