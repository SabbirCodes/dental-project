import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "org"]).default("user"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const orgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
    })
    .optional(),
});
export type OrgInput = z.infer<typeof orgSchema>;

export const dentistSchema = z.object({
  name: z.string().min(2),
  specialization: z.array(z.string()).default([]),
  experienceYears: z.number().optional(),
  bio: z.string().optional(),
  consultationFee: z.number().optional(),
  availability: z
    .array(z.object({ day: z.string(), slots: z.array(z.string()) }))
    .default([]),
});
export type DentistInput = z.infer<typeof dentistSchema>;


export const createReviewSchema = z.object({
  appointmentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>

export const createAppointmentSchema = z.object({
  dentistId: z.string(),
  orgId: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
});
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const platformConfigSchema = z.object({
  siteName: z.string().min(1).optional(),
  supportEmail: z.string().email().optional(),
  requireOrgApproval: z.boolean().optional(),
  cancellationWindowHours: z.number().min(0).optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
});
export type PlatformConfigInput = z.infer<typeof platformConfigSchema>;


