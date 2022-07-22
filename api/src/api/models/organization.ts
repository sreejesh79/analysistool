import { Document, Schema, Model, model } from "mongoose";

interface IOrganization extends Document {}
interface IOrganizationModel extends IOrganization, Document {
}

const Types = Schema.Types;
const OrganizationSchema: Schema = new Schema({
    name: { type: Types.String },
    users: { type: [Types.ObjectId], ref: "User" },
    studies: { type: [Types.ObjectId], ref: "Study" }
});

const OrganizationModel: Model<IOrganizationModel> = model<IOrganizationModel>("Organization", OrganizationSchema);
export default OrganizationModel;