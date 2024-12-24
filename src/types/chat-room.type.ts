import { z } from "zod";

export const CreateChatRoomSchema = z.object({
  name: z.string().min(1, { message: "Name is Required" }),
  is_group: z.boolean().optional(),
});

export const RoomIdSchema = z.object({
  roomId: z.string().min(1, { message: "Room ID is Required" }),
});

export type CreateChatRoom = z.infer<typeof CreateChatRoomSchema>;
export type RoomId = z.infer<typeof RoomIdSchema>;
