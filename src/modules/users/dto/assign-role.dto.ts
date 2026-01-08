import z from "zod";

export const AssignRoleSchema = z.object({
  role_id: z.string().min(1, { message: "Role ID is Required" }),
  user_id: z.string().min(1, { message: "Admin ID is Required" }),
});

export type AssignRole = z.infer<typeof AssignRoleSchema>;
