import GroupModel from "../models/group";
class GroupService {
    private static _singleton: boolean = true;
    private static _instance: GroupService;

    constructor() {
        if (GroupService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use GroupService.instance instead!");
        }
    }

    public static get instance(): GroupService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new GroupService();
            this._singleton = true;
        }
        return this._instance;
    }

    public async getGroupNames(query: any): Promise<any> {
        let response;
        try {
            response = await GroupModel.find(query).select("_id name").lean().exec();
        } catch (e) {
            return {error: true, message: "Invalid Study Id"};
        }
        return response;
    }

}
export default GroupService;