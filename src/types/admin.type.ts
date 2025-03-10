import { z } from "zod";

export const CreateAdminSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required" })
    .max(20, {
      message: "Username must not exceed 20 characters",
    }),
  profilePictureUrl: z.string().url().nullable().optional(),
});

export const AssignAdminRoleSchema = z.object({
  role_id: z.number().min(1, { message: "Role ID is Required" }),
  admin_id: z.string().min(1, { message: "Admin ID is Required" }),
});

export type CreateAdmin = z.infer<typeof CreateAdminSchema>;
export type AssignAdminRole = z.infer<typeof AssignAdminRoleSchema>;
