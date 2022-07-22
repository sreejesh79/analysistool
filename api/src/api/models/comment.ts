import { Document, Schema, Model, model } from "mongoose";

interface IComment extends Document {}
interface ICommentModel extends IComment, Document {

}

const Types = Schema.Types;
const CommentSchema: Schema = new Schema({
    createdBy: { type: Types.ObjectId, ref: "User", index: true },
    text: { type: Types.String },
    post: { type: Types.ObjectId, ref: "Post", index: true, required: true }
});
const CommentModel: Model<ICommentModel> = model<ICommentModel>("Comment", CommentSchema);
export default CommentModel;