import { Schema, model, models, Document, Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  dentistId: Types.ObjectId;
  orgId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  rating: number; 
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dentistId: { type: Schema.Types.ObjectId, ref: "Dentist", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

export default models.Review || model<IReview>("Review", reviewSchema);
