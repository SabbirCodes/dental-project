import { Schema, model, models, Document } from "mongoose";

// Singleton document — there is only ever one PlatformConfig in the
// collection. Always query/update with an empty filter ({}) and
// `upsert: true` rather than tracking an id.
export interface IPlatformConfig extends Document {
  siteName: string;
  supportEmail: string;
  requireOrgApproval: boolean;
  cancellationWindowHours: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const platformConfigSchema = new Schema<IPlatformConfig>(
  {
    siteName: { type: String, default: "BrightSmile" },
    supportEmail: { type: String, default: "support@brightsmile.com" },
    requireOrgApproval: { type: Boolean, default: true },
    cancellationWindowHours: { type: Number, default: 2, min: 0 },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String },
  },
  { timestamps: true },
);

export default models.PlatformConfig ||
  model<IPlatformConfig>("PlatformConfig", platformConfigSchema);
