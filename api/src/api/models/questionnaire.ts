import { Document, Schema, Model, model } from "mongoose";

interface IQuestionnaires extends Document {}
interface IQuestionnairesModel extends IQuestionnaires, Document {
}

const Types = Schema.Types;
const QuestionnairesSchema: Schema = new Schema({
    task: {type: Types.String, required: true},
    tag: {type: Types.String, required: true},
    study: {type: Types.ObjectId, index: true, ref: "Study", required: true},
    posts: {type: [Types.ObjectId], ref: "Post"},
    texts: {type: [Types.ObjectId], ref: "QuestionnaireParticipant"},
    createdBy: {type: Types.ObjectId, ref: "User", required: true}
});

const QuestionnairesModel: Model<IQuestionnairesModel> = model<IQuestionnairesModel>("Questionnaire", QuestionnairesSchema);
export default QuestionnairesModel;