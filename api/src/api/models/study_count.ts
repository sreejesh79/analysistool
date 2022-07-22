import { Document, Schema, Model, model } from "mongoose";
import StudyModel from "./study";

interface IStudyCount extends Document {}
interface IStudyCountModel extends IStudyCount, Document {
}

const Types = Schema.Types;
const StudyCountSchema: Schema = new Schema({
    name : { type: Types.String, required: true, index: true},
    study: { type: Types.ObjectId, ref: "Study", index: true, unique: true, required: true },
    participants: { type: Types.Number, default: 0 },
    images: { type: Types.Number, default: 0 },
    videos: { type: Types.Number, default: 0 },
    isDeleted: { type: Types.Boolean },
    isArchived: { type: Types.Boolean },
    isHide: { type: Types.Boolean }
});

const StudyCountModel: Model<IStudyCountModel> = model<IStudyCountModel>("StudyCount", StudyCountSchema);
export default StudyCountModel;