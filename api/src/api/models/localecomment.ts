import { Document, Schema, Model, model } from "mongoose";

interface ILocaleComment extends Document {}

interface ILocaleCommentModel extends ILocaleComment, Document {
}

const Types = Schema.Types;

const LocaleCommentSchema : Schema = new Schema({   
    comment: { type: Types.ObjectId, ref: 'Comment', index: true, required: true, unique:true },
    text: { type: Types.String, required: true },
    locale: { type: Types.String, required: true  }
}, {  versionKey: false, usePushEach: true  , timestamps: true });

const LocaleCommentModel: Model<ILocaleCommentModel> = model<ILocaleCommentModel>("LocaleComment", LocaleCommentSchema);
export default LocaleCommentModel;