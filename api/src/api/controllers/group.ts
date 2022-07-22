import ApiResponse from "../../lib/apiResponse";
import ApiRequest from "../../lib/apiRequest";
import GroupService from "../services/groupService";
export default class Group {
    public static async getStudyGroups(req: ApiRequest, res: ApiResponse): Promise<any> {
        const body = req.body;
        const query = {isDeleted: false, study: body.studyid};
        if (body.groups && body.groups.length > 0) {
            query["_id"] = { $in: body.groups };
        }
        const response = await GroupService.instance.getGroupNames(query);
        if (response.error) {
            return res.apiError(response.message);
        }
        return res.apiSuccess(response);
    }
}