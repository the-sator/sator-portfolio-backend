import { z } from "zod";

type Resource = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export const CreateResourceSchema = z.object({
  name: z.string().min(1, { message: "Name is Required" }),
});

export type CreateResource = z.infer<typeof CreateResourceSchema>;
