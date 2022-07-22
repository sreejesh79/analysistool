
import { Document, Schema, Model, model } from "mongoose";

interface IParticipant extends Document {}
interface IParticipantModel extends IParticipant, Document {
}

const Types = Schema.Types;
const ParticipantSchema: Schema = new Schema({
    description: { type: Types.String },
    notes: { type: Types.String },
    study: { type: Types.ObjectId, ref: "Study", index: true },
    group: { type: Types.ObjectId, ref: "Group", index: true },
    user: { type: Types.ObjectId, ref: "User", index: true }
});

const ParticipantModel: Model<IParticipantModel> = model<IParticipantModel>("Participant", ParticipantSchema);
export default ParticipantModel;