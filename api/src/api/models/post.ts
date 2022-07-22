import { Document, Schema, Model, model } from "mongoose";

interface IPost extends Document {}
interface IPostModel extends IPost, Document {
}

const Types = Schema.Types;
const PostSchema: Schema = new Schema({
    // The user who created the post
  createdBy: { type: Types.ObjectId, ref: "User", required: true },
  // The end user the post belongs to
  user: { type: Types.ObjectId, ref: "User", required: true },
  study: { type: Types.ObjectId, ref: "Study", required: true },
  imageUrl: { type: Types.String },
  videoUrl: { type: Types.String },
  videoThumbnailUrl: { type: Types.String },
  caption: { type: Types.String },
  resolvedBy: { type: Types.ObjectId, ref: "User" }, // Admin user who marked a post resolved
  resolvedAt: { type: Types.Date },
  isResolved: { type: Types.Boolean, default: false },
  isPostResolved: { type: Types.Boolean, default: false },
  comments: { type: [Types.ObjectId], ref: "Comment" },
  tagsv2: { type: [Types.ObjectId], ref: "Tag" },
  description: { type: Types.String , default: ""},
  images: {type: [Types.String]},
  media: [{ type: Types.ObjectId, ref: "Media"}],
});

const PostModel: Model<IPostModel> = model<IPostModel>("Post", PostSchema);
export default PostModel;