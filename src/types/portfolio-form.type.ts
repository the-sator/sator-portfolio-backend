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

export const CreateFormResponseSchema = z.object({
  question_id: z.string().min(1, { message: "Question ID is required" }),
  option_id: z.string().min(1, { message: "Option ID is required" }),
  metadata: z.any().optional(),
});

export const CreateFormAttemptSchema = z.object({
  responses: z.array(CreateFormResponseSchema),
});

export const PortfolioFormFilterSchema = BaseFilterSchema.extend({
  order: z.string().optional(),
  id: z.string().optional(),
});

export const FormAttemptFilterSchema = BaseFilterSchema.extend({
  id: z.string().optional(),
});

export type CreateFormOption = z.infer<typeof CreateFormOptionSchema>;
export type PortfolioFormFilter = z.infer<typeof PortfolioFormFilterSchema>;
export type CreateFormResponse = z.infer<typeof CreateFormResponseSchema>;
export type CreateFormQuestion = z.infer<typeof CreateFormQuestionSchema>;
export type CreateFormAttempt = z.infer<typeof CreateFormAttemptSchema>;
export type FormAttemptFilter = z.infer<typeof FormAttemptFilterSchema>;
