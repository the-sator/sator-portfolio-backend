import type { Admin, Session } from "@prisma/client";
import { z } from "zod";

export type AdminSessionValidationResult =
  | { session: Session; admin: Admin }
  | { session: null; admin: null };

export const ValidateSessionTokenSchema = z.object({
  token: z.string().trim().min(1, { message: "Token Not Found" }),
});

export const BaseModelSchema = z.object({
  id: z.union([
    z.string().trim().min(1, { message: "ID Not Found" }),
    z.number(),
  ]),
});

export const ValidatedSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .refine((s) => !s.includes(" "), "No Spaces!"),
});

export const BaseFilterSchema = z.object({
  page: z.string().min(1).optional(),
  limit: z.string().min(1).optional(),
});

export type BaseFilter = z.infer<typeof BaseFilterSchema>;
export type ValidateSessionToken = z.infer<typeof ValidateSessionTokenSchema>;
export type BaseModel = z.infer<typeof BaseModelSchema>;
