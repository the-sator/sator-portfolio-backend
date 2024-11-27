import type { Role } from "@prisma/client";
import { z } from "zod";

export const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(20, { message: "Name cannot be longer than 20 characters" }),

  permissions: z.array(
    z.object({
      delete: z.boolean(),
      resource_id: z.number(),
      read: z.boolean(),
      write: z.boolean(),
    })
  ),
});

export const UpdateRoleSchema = z.object({
  permissions: z.array(
    z.object({
      delete: z.boolean(),
      resource_id: z.number(),
      read: z.boolean(),
      write: z.boolean(),
    })
  ),
});

export const CheckRoleSchema = z.object({
  role_id: z.number().min(1, { message: "Role ID is Required" }),
  resource: z.string().min(1, { message: "Resource Name is Required" }),
});

export type CreateRole = z.infer<typeof CreateRoleSchema>;
export type UpdateRole = z.infer<typeof UpdateRoleSchema>;
export type CheckRole = z.infer<typeof CheckRoleSchema>;
