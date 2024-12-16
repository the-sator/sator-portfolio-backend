import { ChatMessageType } from "@prisma/client";
import { z } from "zod";

export const CreateChatMessageSchema = z.object({
  chat_member_id: z.string(),
  chat_room_id: z.string(),
  content: z.string().trim().min(1, { message: "Message cannot be empty" }),
  message_type: z.nativeEnum(ChatMessageType),
});

export type CreateChatMessage = z.infer<typeof CreateChatMessageSchema>;
