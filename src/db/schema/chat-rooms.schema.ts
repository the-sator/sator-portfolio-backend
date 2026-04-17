import {
  boolean,
  pgTable,
  text,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { timestamps } from "../common";
import { relations } from "drizzle-orm";
import { chatMembers, chatMessages, unreadMessages } from ".";

export const chatRooms = pgTable("chat_rooms", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  name: text().notNull(),
  is_group: boolean().notNull(),
  last_message_id: uuid().references((): AnyPgColumn => chatMessages.id),
  ...timestamps,
});

export const chatRoomRelation = relations(chatRooms, ({ one, many }) => ({
  chat_members: many(chatMembers),
  chat_messages: many(chatMessages),
  unread_messages: many(unreadMessages),
  last_message: one(chatMessages, {
    fields: [chatRooms.last_message_id],
    references: [chatMessages.id],
  }),
}));
