import { Document, Schema, Model, model } from "mongoose";

interface ITagComment extends Document {}
interface ITagCommentModel extends ITagComment, Document {
}

const Types = Schema.Types;
const TagCommentSchema: Schema = new Schema({
    text: {type: Types.String, index: false, required: true},
    participant: {type: Types.ObjectId, ref: "Participant", required: true},
    comment: {type: Types.ObjectId, ref: "Comment", required: true, index: true},
    entity: {type: Types.ObjectId, refPath: "onModel", required: true, index: true},
    onModel: {type: Types.String, enum: ['Comment', 'LocaleComment'], required: true},
    type: {type: Types.String, default: ""}
});

const TagCommentModel: Model<ITagCommentModel> = model<ITagCommentModel>("TagComment", TagCommentSchema);
export default TagCommentModel;