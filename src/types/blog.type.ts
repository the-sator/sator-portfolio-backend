import { z } from "zod";

export const CreateBlogSchema = z.object({
  admin_id: z.string().min(1, { message: "Admin ID is required!!" }),
  name: z
    .string()
    .min(5, { message: "Name must be atleast 5 characters!!" })
    .max(50, { message: "Name must be less than 50 characters!!" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be atleast 3 characters!!" })
    .max(20, { message: "Slug must be less than 20 characters!!" }),
  content: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export type CreateBlog = z.infer<typeof CreateBlogSchema>;
