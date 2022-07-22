import { Document, Schema, Model, model } from "mongoose";

interface IStudy extends Document {}
interface IStudyModel extends IStudy, Document {
}

const Types = Schema.Types;
const StudySchema: Schema = new Schema({
    name: { type: Types.String, required: true, index: true, unique: true },
    description: { type: Types.String },
    brandImageUrl: { type: Types.String },
    imageObjectKey : {type: Types.String, index: true},
    imageUrl: { type: Types.String },
    client: { type: Types.ObjectId, ref: "Organization", required: true },
    archivedAt: { type: Types.Date },
    isArchived: { type: Types.Boolean, default: false },
    isHide: { type: Types.Boolean, default: false },
    beginsOn: { type: Types.Date },
    endsOn: { type: Types.Date },
    findings: { type: Types.String },
    groups: [{ type: Types.ObjectId, ref: "Group" }],
    tags: [{ type: Types.ObjectId, ref: "Tag"}],
    isNewStudy: { type: Types.Boolean },
    __oldClient: { type: Types.ObjectId, ref: "Organization" }
}, { versionKey: false, usePushEach: true  , timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } });

const StudyModel: Model<IStudyModel> = model<IStudyModel>("Study", StudySchema);
export default StudyModel;