import { Document, Schema, Model, model } from "mongoose";
interface IMedia extends Document {
    name: string;
    machine_name: string;
}
interface IMediaModel extends IMedia, Document {

}

const Types = Schema.Types;
const MediaSchema: Schema = new Schema({
    video: { type: Types.String, default: "", index: true },
    image: { type: Types.String, required: true },
    imageObjectKey : {type: Types.String, index: true},
    videoObjectKey : {type: Types.String, index: true},
    post: { type: Types.ObjectId, ref: "Post", index: true, required: true },
    createdBy: {type: Types.ObjectId, ref: "User", index: true, required: true},
    description: { type: Types.String , default:""}
}, { timestamps: true});

const MediaModel: Model<IMediaModel> = model<IMediaModel>("Media", MediaSchema);
export default MediaModel;