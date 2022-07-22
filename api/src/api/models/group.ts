import { Document, Schema, Model, model } from "mongoose";

interface IGroup extends Document {}
interface IGroupModel extends IGroup, Document {
}

const Types = Schema.Types;
const GroupSchema: Schema = new Schema({
  study: { type: Types.ObjectId, ref: "Study", index: true, required: true },
  name: { type: Types.String, index: true },
  introduction: { type: Types.String },
  description: { type: Types.String },
  __oldStudy: { type: Types.ObjectId, ref: "Study" }
});

const GroupModel: Model<IGroupModel> = model<IGroupModel>("Group", GroupSchema);
export default GroupModel;