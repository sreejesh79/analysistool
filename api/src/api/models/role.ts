import mongoose, { Document, Schema, Model, model } from "mongoose";

interface IRole extends Document {}
interface IRoleModel extends IRole, Document {
}
const modelsEnum = function() {
    const models = mongoose.modelNames();
    // Add Role into the mix
    models.push("Role");
    return models;
  };
const Types = Schema.Types;
const RoleSchema: Schema = new Schema({
    resource: { type: Types.String, enum: { values: modelsEnum(), message: "{VALUE} not found in enum for resource"} },
    read: { type: Types.Boolean, default: false },
    write: { type: Types.Boolean, default: false }
});

const RoleModel: Model<IRoleModel> = model<IRoleModel>("Role", RoleSchema);
export default RoleModel;