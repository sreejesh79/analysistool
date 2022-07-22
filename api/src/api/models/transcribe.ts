import { Document, Schema, Model, model } from "mongoose";

interface ITranscribe extends Document {
    name: string;
    machine_name: string;
}
interface ITranscribeModel extends ITranscribe, Document {

}

const Types = Schema.Types;
const TranscribeSchema: Schema = new Schema({
    post: {type: Types.ObjectId, ref: "Post"},
    comment: {type: Types.ObjectId, ref: "Comment"},
    status: {type: Types.String, enum: ["n", "i", "c", "f"]},
    createdBy: {type: Types.ObjectId, ref: "User"},
    message: {type: Types.String},
    media: {type: Types.ObjectId, ref: "Media", index: true},
    videoUrl: {type: Types.String, index: true}
}, { versionKey: false, usePushEach: true  , timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } });


const TranscribeModel: Model<ITranscribeModel> = model<ITranscribeModel>("Transcribe", TranscribeSchema);
export default TranscribeModel;