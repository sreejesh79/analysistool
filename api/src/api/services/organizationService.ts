import OrganizationModel from "../models/organization";

class OrganizationService {
    private static _singleton: boolean = true;
    private static _instance: OrganizationService;

    constructor() {
        if (OrganizationService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use OrganizationService.instance instead!");
        }
    }

    public static get instance(): OrganizationService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new OrganizationService();
            this._singleton = true;
        }
        return this._instance;
    }

    public async getAll(query: any) {

        let organizations = [];
        try {
            organizations = await OrganizationModel.find(query).select("name studies").lean().exec();
        } catch (e) {
            return {error: true, message: "Error"};
        }
        return organizations;
    }

    public async getOrganizationsList (query: any): Promise<any> {
        let organizations: any = [];
        try {
            organizations = await OrganizationModel.find(query).select("name studies").lean().exec();
        } catch (e) {
            return {error: true, message: "Invalid Organization Id(s)"};
        }
        return organizations;
    }


}
export default OrganizationService;