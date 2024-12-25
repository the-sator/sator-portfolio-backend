import { ChatMessageType } from "@prisma/client";
import { z } from "zod";
import { BaseFilterSchema } from "./base.type";

export const CreateChatMessageSchema = z.object({
  chat_member_id: z.string(),
  chat_room_id: z.string(),
  content: z.string().trim(),
  media: z.array(z.string()).optional(),
  message_type: z.nativeEnum(ChatMessageType),
});

export const ChatMessageFilterSchema = BaseFilterSchema.extend({
  content: z.string().optional(),
});
export type CreateChatMessage = z.infer<typeof CreateChatMessageSchema>;
export type ChatMessageFilter = z.infer<typeof ChatMessageFilterSchema>;
