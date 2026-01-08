import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { enumToPgEnum } from "../common";
import { chatMessages, chatRooms, unreadMessages, users } from ".";
import { ChatMemberRoleEnum } from "@/modules/chat-member/model/chat-member.enum";
import { relations } from "drizzle-orm";
export const chatMemberRole = pgEnum(
  "ChatMemberRoleEnum",
  enumToPgEnum(ChatMemberRoleEnum)
);
export const chatMembers = pgTable("chat_members", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  role: chatMemberRole().default(ChatMemberRoleEnum.MEMBER),
  joined_at: timestamp().defaultNow(),
  left_at: timestamp(),
  user_id: uuid().references(() => users.id),
  chat_room_id: uuid().references(() => chatRooms.id),
});

export const chatMemberRelation = relations(chatMembers, ({ one, many }) => ({
  user: one(users, {
    fields: [chatMembers.user_id],
    references: [users.id],
  }),
  chat_room: one(chatRooms, {
    fields: [chatMembers.chat_room_id],
    references: [chatRooms.id],
  }),
  chat_messages: many(chatMessages),
  unread_messages: many(unreadMessages),
}));
