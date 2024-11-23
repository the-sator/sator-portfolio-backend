import { z } from "zod";

export const CreateAdminSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required" })
    .max(20, {
      message: "Username must not exceed 20 characters",
    }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  profilePictureUrl: z.string().url().nullable().optional(),
});

export type CreateAdmin = z.infer<typeof CreateAdminSchema>;
