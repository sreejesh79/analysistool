import { Document, Schema, Model, model } from "mongoose";

interface IState extends Document {}
interface IStateModel extends IState, Document {
}

const Types = Schema.Types;
const StateSchema: Schema = new Schema({
    name: { type: Types.String, unique: true, required: true },
    machine_name: { type: Types.String, unique: true, required: true},
    country: { type: Types.ObjectId, ref: "Country", required: true},
    cities: [{ type: Types.ObjectId, ref: "City" }]
});

const StateModel: Model<IStateModel> = model<IStateModel>("State", StateSchema);
export default StateModel;