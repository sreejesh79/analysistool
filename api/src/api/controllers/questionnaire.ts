import ApiResponse from "../../lib/apiResponse";
import ApiRequest from "../../lib/apiRequest";
import UserType from "../../common/constants";
import UserService from "../services/userService";
import QuestionnaireService from "../services/questionaireService";
export default class Questionnaire {
 
    public static async getPresetStudyTagsByUserType(req: ApiRequest, res: ApiResponse) {
        const user: any = req.socket.user;
        let studyTags: any = [];
        if(user.userType == UserType.ADMIN) {
            studyTags = await QuestionnaireService.getQuestionniareTagList({});
        } else if (user.userType == UserType.MODERATOR || user.userType == UserType.CLIENT || user.userType == UserType.CLIENT_ADMINISTRATOR) {
                const userStudies = await UserService.instance.getUserStudyIds(user._id);
                if(userStudies.error) {
                    return res.apiError(userStudies.message);
                }
                studyTags = await QuestionnaireService.getQuestionniareTagList({study: {$in: userStudies}});
        }
        if(studyTags.error) {
            return res.apiError(studyTags.message);
        }
        return res.apiSuccess(studyTags);
    }
}