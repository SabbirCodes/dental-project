import mongoose, { Schema, model, models, Document, Types } from "mongoose";

interface IAvailability {
  day: string;
  slots: string[];
}

export interface IDentist extends Document {
  orgId: Types.ObjectId;
  name: string;
  photo?: string;
  specialization: string[];
  experienceYears?: number;
  bio?: string;
  consultationFee?: number;
  availability: IAvailability[];
  active: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const dentistSchema = new Schema<IDentist>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true },
    name: { type: String, required: true },
    photo: String,
    specialization: [String],
    experienceYears: Number,
    bio: String,
    consultationFee: Number,
    availability: [{ day: String, slots: [String] }],
    active: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Dentist || model<IDentist>("Dentist", dentistSchema);