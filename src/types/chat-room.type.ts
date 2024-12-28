import { z } from "zod";
import { BaseFilterSchema } from "./base.type";

export const CreateChatRoomSchema = z.object({
  name: z.string().min(1, { message: "Name is Required" }),
  chat_members: z.array(z.string()).optional(),
  is_group: z.boolean().optional(),
});

export const RoomIdSchema = z.object({
  roomId: z.string().min(1, { message: "Room ID is Required" }),
});

export const ChangeChatRoomNameSchema = z.object({
  name: z.string({ message: "Name is Required" }),
});

export const ChatRoomFilterSchema = BaseFilterSchema.extend({
  chat_room_name: z.string().optional(),
});

export type CreateChatRoom = z.infer<typeof CreateChatRoomSchema>;
export type ChangeChatRoomName = z.infer<typeof ChangeChatRoomNameSchema>;
export type RoomId = z.infer<typeof RoomIdSchema>;
export type ChatRoomFilter = z.infer<typeof ChatRoomFilterSchema>;
