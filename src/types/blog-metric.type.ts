import { z } from "zod";

export const CreateBlogMetricSchema = z.object({
  blog_id: z.string({ message: "Blog ID is required" }),
  like: z.number().optional(),
  view: z.number().optional(),
});

export type CreateBlogMetric = z.infer<typeof CreateBlogMetricSchema>;
