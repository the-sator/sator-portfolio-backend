import { z } from "zod";
import { BaseFilterSchema } from "./base.type";
import { BaseAuthSchema } from "./auth.type";

export const CreateSiteUserSchema = z.object({
  website_name: z.string().trim().min(1),
  link: z.string().min(1).trim(),
  user_id: z.string().min(1).trim(),
});

export const SiteUserFilterSchema = BaseFilterSchema.extend({
  username: z.string().optional(),
});
export const SiteUserAuthSchema = BaseAuthSchema;

export type CreateSiteUser = z.infer<typeof CreateSiteUserSchema>;
export type SiteUserFilter = z.infer<typeof SiteUserFilterSchema>;
export type SiteUserAuth = z.infer<typeof SiteUserAuthSchema>;
