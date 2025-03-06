import { z } from "zod";
import { BaseFilterSchema } from "./base.type";

export const CreateSiteUserSchema = z.object({
  username: z.string().min(1),
  website_name: z.string().trim().min(1),
  link: z.string().min(1).trim(),
  user_id: z.string().min(1).trim(),
});

export const OnboardingSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const SiteUserFilterSchema = BaseFilterSchema.extend({
  username: z.string().optional(),
});

export const SiteUserAuthSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  otp: z.number().lt(999999, { message: "Must be 6 characters long" }),
});

export type CreateSiteUser = z.infer<typeof CreateSiteUserSchema>;
export type SiteUserFilter = z.infer<typeof SiteUserFilterSchema>;
export type SiteUserAuth = z.infer<typeof SiteUserAuthSchema>;
export type Onboarding = z.infer<typeof OnboardingSchema>;
