import { ChatMessageTypeEnum } from "@/modules/chat-messages/model/chat-message.enum";
import { z } from "zod";
import { BaseFilterSchema } from "@/core/types/base.type";

export const CreateChatMessageSchema = z.object({
  chat_member_id: z.string(),
  chat_room_id: z.string(),
  content: z.string().trim(),
  media: z.array(z.string()).optional(),
  message_type: z.nativeEnum(ChatMessageTypeEnum),
});

export const ChatMessageFilterSchema = BaseFilterSchema.extend({
  content: z.string().optional(),
});
export type CreateChatMessage = z.infer<typeof CreateChatMessageSchema>;
export type ChatMessageFilter = z.infer<typeof ChatMessageFilterSchema>;
