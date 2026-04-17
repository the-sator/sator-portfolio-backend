import { z } from "zod";

export const UpdateTotpSchema = z.object({
  key: z.string().trim().min(1, { message: "Key is required" }),
  code: z.string().trim().min(1, { message: "Code is required" }),
});

export type DecryptedTotp = {
  key: Uint8Array;
  code: string;
};
export type UpdateTotp = z.infer<typeof UpdateTotpSchema>;
