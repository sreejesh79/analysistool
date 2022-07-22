import { Document, Schema, Model, model } from "mongoose";

interface ICountry extends Document {}
interface ICountryModel extends ICountry, Document {
}

const Types = Schema.Types;
const CountrySchema: Schema = new Schema({
    name: { type: Types.String, unique: true, required: true },
    machine_name: { type: Types.String, unique: true, required: true},
    states: [{ type: Types.ObjectId, ref: "State" }],
    cities: [{ type: Types.ObjectId, ref: "City" }]
});

const CountryModel: Model<ICountryModel> = model<ICountryModel>("Country", CountrySchema);
export default CountryModel;