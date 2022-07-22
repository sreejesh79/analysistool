import { Document, Schema, Model, model } from "mongoose";

interface ITag extends Document {}
interface ITagModel extends ITag, Document {
}

const Types = Schema.Types;
const TagSchema: Schema = new Schema({
    study: { type: Types.ObjectId, ref: "Study", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    name: { type: Types.String , required: true , trim: true},
    type: { type: Types.String, default: "", enum: ["question", ""]},
    texts: {type: [Types.ObjectId], ref: "TagComment"},
    posts: { type: [Types.ObjectId], ref: "Post" },
    questionnaire: { type: Types.ObjectId, ref: "Questionnaire" }
});

const TagModel: Model<ITagModel> = model<ITagModel>("Tag", TagSchema);
export default TagModel;