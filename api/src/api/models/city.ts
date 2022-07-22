import { Document, Schema, Model, model } from "mongoose";

interface ICity extends Document {}
interface ICityModel extends ICity, Document {
}

const Types = Schema.Types;
const CitySchema: Schema = new Schema({
    name: { type: Types.String, unique: true, required: true },
    machine_name: { type: Types.String, unique: true, required: true},
    country: { type: Types.ObjectId, ref: "Country", required: true},
    state: { type: Types.ObjectId, ref: "State", required: true }
});

const CityModel: Model<ICityModel> = model<ICityModel>("City", CitySchema);
export default CityModel;