import { z } from "zod";
import { BaseFilterSchema } from "./base.type";

export const CreateFormOptionSchema = z.object({
  // question_id: z.string().min(1, { message: "Question ID is required" }),
  option_text: z.string().min(1, { message: "Text is required" }),
  price: z.number({ message: "Price is required" }).array(),
});

export const CreateFormQuestionSchema = z.object({
  form_text: z.string().min(1, { message: "Text is required" }),
  order: z.number().min(1, { message: "Order must be bigger or equal to 1" }),
  options: z.array(CreateFormOptionSchema),
});

export const PortfolioFormFilterSchema = BaseFilterSchema.extend({
  order: z.string().optional(),
  id: z.string().optional(),
});

export type CreateFormQuestion = z.infer<typeof CreateFormQuestionSchema>;
export type CreateFormOption = z.infer<typeof CreateFormOptionSchema>;
export type PortfolioFormFilter = z.infer<typeof PortfolioFormFilterSchema>;
