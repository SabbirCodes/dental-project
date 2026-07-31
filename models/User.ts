import mongoose, { Schema, model, models, Document, Types } from "mongoose";
import type { Role } from "@/types/roles";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: "active" | "pending" | "suspended";
  orgId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "org", "admin", "superadmin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    orgId: { type: Schema.Types.ObjectId, ref: "Org" },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", userSchema);