import ParticipantModel from "../models/participant";
import GroupModel from "../models/group";
import UserModel from "../models/user";

class ParticipantService {

    private static _singleton: boolean = true;
    private static _instance: ParticipantService;

    constructor() {
        if (ParticipantService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use ParticipantService.instance instead!");
        }
    }

    public static get instance(): ParticipantService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new ParticipantService();
            this._singleton = true;
        }
        return this._instance;
    }
    public async getStudyParticipants(query: any): Promise<any> {
        let participants = [];
        try {
            participants = await ParticipantModel.find(query)
            .populate({ path: "group", select: "name", model: GroupModel })
            .populate("user", "userType birthdate lastName firstName city")
            .lean()
            .exec();
        } catch (e) {
            return {error: true, message: "Invalid Study Id"};
        }
        return participants;
    }

    public async getParticipantsDataInArray(participantIds: any) {
        const participantData = await ParticipantModel.find({_id : {$in: participantIds}})
        .populate({ path: "group", select: "name", model: GroupModel })
        .populate("user", "userType birthdate lastName firstName city")
        .lean().exec();
        return participantData;
    }

    public async getParticipantUserInStudy(query: any) {
        let participants = [];
        try {
            participants = await ParticipantModel.findOne(query)
            .populate({ path: "group", select: "name", model: GroupModel })
            .populate("user", "userType birthdate lastName firstName city")
            .lean()
            .exec();
        } catch (e) {
            return {error: true, message: "Invalid Study or User Id"};
        }
        return participants;
    }

    public async getAllParticipantsInStudyArr(query: any) {
        let participants = [];
        try {
            participants = await ParticipantModel.find(query).select("user study")
            .populate({path: "user", model: UserModel, select: "userType lastName firstName profileImageUrl", match: {userType: "Prospect"}})
            .lean()
            .exec();
            participants = participants.filter(participant => participant && participant.user);
        } catch (e) {
            return {error: true, message: "Invalid Study Id(s)"};
        }
        return participants;
    }
}

export default ParticipantService;