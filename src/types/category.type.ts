import { z } from "zod";

enum Color {
  BLUE = "BLUE",
  RED = "RED",
  VIOLET = "VIOLET",
  PURPLE = "PURPLE",
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  ORANGE = "ORANGE",
  GRAY = "GRAY",
  TEAL = "TEAL",
  INDIGO = "INDIGO",
}

export const CreateCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  color: z.nativeEnum(Color).optional(),
});

export const AssignCategorySchema = z.object({
  portfolio_id: z.string().min(1, { message: "Portfolio ID is required" }),
  category_id: z.string().min(1, { message: "Category ID is required" }),
  assignedBy: z.string().min(1, { message: "Assigned By is required" }),
});

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type AssignCategory = z.infer<typeof AssignCategorySchema>;
