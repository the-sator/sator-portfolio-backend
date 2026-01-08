import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().trim().min(1).max(20, {
    message: "Username must not exceeed 20 characters",
  }),
  role_id: z.string(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
