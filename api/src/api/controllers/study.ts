import StudyFilter from "../factory/study";

import StudyService from "../services/studyService";
import ApiRequest from "../../lib/apiRequest";
import ApiResponse from "../../lib/apiResponse";
import UserType from "../../common/constants";
import UserService from "../services/userService";

class Study {

    public static async get(req: ApiRequest, res: ApiResponse): Promise<any> {
        const body: any = req.body;
        console.log(body);
        const filters = await StudyFilter.filter(body.filter);
        if (filters.error) {
            return res.apiError(filters.body);
        } else {
            const response: any =  await StudyService.instance.get("study.get", req, filters, body.skip ? body.skip : undefined);
            if (response.error) {
                return res.apiError(response.body);
            } else {
                return res.apiSuccess(response.body);
            }
        }
    }
    public static async getStudyName(req: ApiRequest, res: ApiResponse): Promise<any> {
        const body: any = req.body;
        const response: any = await StudyService.instance.getStudyName(body.studyid, req);
        if (response.error) {
            return res.apiError(response.message);
        } else {
            return res.apiSuccess(response["name"]);
        }
    }

    public static async getStudyInfo(req: ApiRequest, res: ApiResponse): Promise<any> {
        const body: any = req.body;
        const response: any = await StudyService.instance.getStudyInfo(body.studyid);
        if (response.error) {
            return res.apiError(response.error);
        } else {
            return res.apiSuccess(response);
        }
    }

    public static async getParticipants(req: ApiRequest, res: ApiResponse) {
        const body: any = req.body;
        const response: any = await StudyService.instance.getStudyParticipants(body.studyid);
        if (response.error) {
            return res.apiError(response.error);
        } else {
            return res.apiSuccess(response);
        }
    }

    public static async getStudyList(req: ApiRequest, res: ApiResponse) {
        const user: any = req.socket.user;
        let studies: any = [];
        if(user.userType == UserType.ADMIN) {
            studies = await StudyService.instance.getStudyList({});
        } else if (user.userType == UserType.MODERATOR || user.userType == UserType.CLIENT || user.userType == UserType.CLIENT_ADMINISTRATOR) {
                const userStudies = await UserService.instance.getUserStudyIds(user._id);
                if(userStudies.error) {
                    return res.apiError(userStudies.message);
                }
                studies = await StudyService.instance.getStudyList({_id: {$in: userStudies}});
        }
        if(studies.error) {
            return res.apiError(studies.message);
        }
        studies = studies.filter(study=>!study.isHide)
        return res.apiSuccess(studies);
    }

}

export default Study;