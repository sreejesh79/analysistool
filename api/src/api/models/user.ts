import { Document, Schema, Model, model } from "mongoose";

interface IUser extends Document {}
interface IUserModel extends IUser, Document {

}

const Types = Schema.Types;
const UserSchema: Schema = new Schema({
    firstName: { type: Types.String, index: true, text: true },
    lastName: { type: Types.String, index: true},
    role: { type: Types.ObjectId, ref: "Role"},
    userType: { type: Types.String },
    // Personal info
    birthdate: { type: Types.Date },
    city: { type: Types.String, default: ""},
    /* Client fields */
    organization: { type: Types.ObjectId, ref: "Organization"},
    __oldOrganization: { type: Types.ObjectId, ref: "Organization" },
    /* Study fields */
    studies: [{ type: Types.ObjectId, ref: "Study" }],
    pp_accepted: { type: Types.Boolean, default: false }
});

const UserModel: Model<IUserModel> = model<IUserModel>("User", UserSchema);
export default UserModel;