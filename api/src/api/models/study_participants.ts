import { Document, Schema, Model, model } from "mongoose";

interface IStudyParticipants extends Document {}
interface IStudyParticipantsModel extends IStudyParticipants, Document {
}

const Types = Schema.Types;
const StudyParticipantsSchema: Schema = new Schema({
    study: {type: Types.ObjectId, ref: "Study"},
    participant: {type: Types.ObjectId, ref: "Participant"},
    user: {type: Types.ObjectId, ref: "User"},
    group: {type: Types.ObjectId, ref: "Group"},
    lastUpdated: {type: Types.Number},
    sendPosts: {type: Types.Number},
    recievedPosts: {type: Types.Number}
});

const StudyParticipantsModel: Model<IStudyParticipantsModel> = model<IStudyParticipantsModel>("StudyParticipants", StudyParticipantsSchema);
export default StudyParticipantsModel;