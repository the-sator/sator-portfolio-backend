import { z } from "zod";
import { BaseFilterSchema } from "./base.type";

export const CreatePortfolioSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(200, {
      message: "Description should not be longer than 200 characters",
    }),
  slug: z.string().min(1, { message: "Slug is required" }),
  cover_url: z.string().optional(),
  preview_link: z.string().optional(),
  github_link: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  content: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export const PortfolioFilterSchema = BaseFilterSchema.extend({
  title: z.string().optional(),
  categories: z.union([z.array(z.string()), z.string()]).optional(),
  published: z.boolean().optional(),
});

export type CreatePortfolio = z.infer<typeof CreatePortfolioSchema>;
export type PortfolioFilter = z.infer<typeof PortfolioFilterSchema>;
