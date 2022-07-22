import ApiRequest from "../../lib/apiRequest";
import ApiResponse from "../../lib/apiResponse";
import OrganizationService from "../services/organizationService";
import UserType from "../../common/constants";
import UserService from "../services/userService";
import StudyService from "../services/studyService";

class Organization {

    public static async get(req: ApiRequest, res: ApiResponse): Promise<any> {
        const response: any = await OrganizationService.instance.getAll({});
        if (response.error) {
            return res.apiError(response.error);
        } else {
            return res.apiSuccess(response);
        }
    }

    public static async getOrganizationList(req: ApiRequest, res: ApiResponse): Promise<any> {
        const user: any = req.socket.user;
        let organizations: any = [];
        // if (user.userType == UserType.CLIENT) {
        //     return res.apiSuccess(organizations);
        // }
        if(user.userType == UserType.ADMIN) {
            organizations = await OrganizationService.instance.getAll({});
        } else if (user.userType == UserType.CLIENT || user.userType == UserType.CLIENT_ADMINISTRATOR || user.userType == UserType.MODERATOR) {
                const userStudies = await UserService.instance.getUserStudyIds(user._id);
                if(userStudies.error) {
                    return res.apiError(userStudies.message);
                }
                const studies = await StudyService.instance.getStudyList({_id: {$in: userStudies}});
                if(studies.error) {
                    return res.apiError(studies.message);
                }
                const clients = studies.map(item => item.client);
                organizations = await OrganizationService.instance.getAll({_id: {$in: clients}});
        }
        if(organizations.error) {
            return res.apiError(organizations.message);
        }
        return res.apiSuccess(organizations);
    }

}

export default Organization;