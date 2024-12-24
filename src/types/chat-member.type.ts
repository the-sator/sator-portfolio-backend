import { ChatMemberRole } from "@prisma/client";
import { z } from "zod";

export const CreateChatMemberSchema = z.object({
  user_id: z.string().optional(),
  admin_id: z.string().optional(),
  role: z.nativeEnum(ChatMemberRole),
  chat_room_id: z.string({ message: "Chat Room ID is Required" }),
});

export const InviteChatMemberSchema = z.object({
  chat_members: z.array(z.string(), { message: "Chat Member is Required" }),
  chat_room_id: z.string({ message: "Chat Room ID is Required" }),
});

export type CreateChatMember = z.infer<typeof CreateChatMemberSchema>;
export type InviteChatMember = z.infer<typeof InviteChatMemberSchema>;
