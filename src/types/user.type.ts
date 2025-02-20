import { z } from "zod";
import { BaseFilterSchema } from "./base.type";

export const CreateUserSchema = z.object({
  username: z.string().trim().min(1).max(20, {
    message: "Username must not exceeed 20 characters",
  }),
});

export const UserFilterSchema = BaseFilterSchema.extend({
  username: z.string().optional(),
  email: z.string().optional(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UserFilter = z.infer<typeof UserFilterSchema>;
