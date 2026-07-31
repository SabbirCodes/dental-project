import mongoose, { Schema, model, models, Document, Types } from "mongoose";

interface IWorkingHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface IOrg extends Document {
  ownerId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address: IAddress;
  contact: { phone?: string; email?: string; website?: string };
  workingHours: IWorkingHours[];
  verified: boolean;
  status: "pending" | "approved" | "rejected" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const orgSchema = new Schema<IOrg>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    logo: String,
    coverImage: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      lat: Number,
      lng: Number,
    },
    contact: { phone: String, email: String, website: String },
    workingHours: [
      { day: String, open: String, close: String, closed: Boolean },
    ],
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Org || model<IOrg>("Org", orgSchema);