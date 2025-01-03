import { z } from "zod";
import { BaseFilterSchema } from "./base.type";

export const CreateSiteUserSchema = z.object({
  username: z.string().trim().min(1).max(20, {
    message: "Username must not exceeed 20 characters",
  }),
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const SiteUserFilterSchema = BaseFilterSchema.extend({
  username: z.string().optional(),
  email: z.string().optional(),
});

export type CreateSiteUser = z.infer<typeof CreateSiteUserSchema>;
export type SiteUserFilter = z.infer<typeof SiteUserFilterSchema>;
