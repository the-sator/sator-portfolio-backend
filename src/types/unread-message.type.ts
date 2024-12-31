import { z } from "zod";

const CreateUnreadMessageSchema = z.object({
  chat_member_id: z.string(),
  chat_room_id: z.string(),
  total_count: z.number(),
});

export type CreateUnreadMessage = z.infer<typeof CreateUnreadMessageSchema>;
