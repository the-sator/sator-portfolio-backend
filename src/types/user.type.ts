import { z } from "zod";

export type User = {
  id: number;
  email: string;
  name: string | null;
};

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1).max(20, {
    message: "Username must not exceeed 20 characters",
  }),
  email: z.string().email(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
