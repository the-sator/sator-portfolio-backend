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

export const UpdateAdminTotpSchema = z.object({
  id: z.string().trim().min(1, { message: "Admin ID is required" }),

  key: z.string().trim().min(1, { message: "Key is required" }),
  code: z.string().trim().min(1, { message: "Code is required" }),
  sessionId: z.string().trim().min(1, { message: "Session ID is required" }),
});

export const AssignAdminRoleSchema = z.object({
  role_id: z.number().min(1, { message: "Role ID is Required" }),
  admin_id: z.string().min(1, { message: "Admin ID is Required" }),
});

export type CreateAdmin = z.infer<typeof CreateAdminSchema>;
export type UpdateAdminTotp = z.infer<typeof UpdateAdminTotpSchema>;
export type AssignAdminRole = z.infer<typeof AssignAdminRoleSchema>;
