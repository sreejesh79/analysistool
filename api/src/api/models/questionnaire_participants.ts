import { Document, Schema, Model, model } from "mongoose";

interface IQuestionnaireParticipant extends Document {}
interface IQuestionnaireParticipantModel extends IQuestionnaireParticipant, Document {

}

const Types = Schema.Types;
const QuestionnaireParticipantSchema = new Schema({
        text: {type: Types.String, index: false, required: true},
        participant: {type: Types.ObjectId, ref: "Participant", required: true},
        comment: {type: Types.ObjectId, ref: "Comment", required: true, index: true},
        entity: {type: Types.ObjectId, refPath: "onModel", required: true, index: true},
        onModel: {type: Types.String, enum: ['Comment', 'LocaleComment'], required: true},
        type: {type: Types.String, default: "ques"}
});
const QuestionnaireParticipantModel: Model<IQuestionnaireParticipantModel> = model<IQuestionnaireParticipantModel>("QuestionnaireParticipant", QuestionnaireParticipantSchema);
export default QuestionnaireParticipantModel;