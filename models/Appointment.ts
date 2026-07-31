import { Schema, model, models, Document, Types } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  orgId: Types.ObjectId;
  dentistId: Types.ObjectId;
  date: Date;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true },
    dentistId: { type: Schema.Types.ObjectId, ref: "Dentist", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
    },
    notes: String,
    cancelReason: String,
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { dentistId: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["pending", "confirmed"] } } }
);

export default models.Appointment || model<IAppointment>("Appointment", appointmentSchema);
