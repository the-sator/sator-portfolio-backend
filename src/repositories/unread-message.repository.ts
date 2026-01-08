import type { CreateUnreadMessage } from "@/types/unread-message.type";
import { type DrizzleTransaction, db } from "@/db";
import { unreadMessages } from "../db/schema/unread-messages.schema";
import { eq, and } from "drizzle-orm";

export class UnreadMessageRepository {
  public async findAll(tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    return await client.select().from(unreadMessages);
  }

  public async findByMember(
    chat_room_id: string,
    auth_id: string,
    tx?: DrizzleTransaction
  ) {
    const client = tx ? tx : db;
    const { chatMembers } = await import("../db/schema/chat-members.schema");
    const { or } = await import("drizzle-orm");

    return await client
      .select()
      .from(unreadMessages)
      .innerJoin(chatMembers, eq(unreadMessages.chat_member_id, chatMembers.id))
      .where(
        and(
          eq(unreadMessages.chat_room_id, chat_room_id),
          or(eq(chatMembers.user_id, auth_id))
        )
      )
      .limit(1);
  }

  public async findByAuthId(auth_id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const { chatMembers } = await import("../db/schema/chat-members.schema");
    const { or } = await import("drizzle-orm");

    return await client
      .select()
      .from(unreadMessages)
      .innerJoin(chatMembers, eq(unreadMessages.chat_member_id, chatMembers.id))
      .where(or(eq(chatMembers.user_id, auth_id)));
  }

  public async checkIfExist(
    chat_room_id: string,
    chat_member_id: string,
    tx?: DrizzleTransaction
  ) {
    const client = tx ? tx : db;
    const { and } = await import("drizzle-orm");

    const [result] = await client
      .select()
      .from(unreadMessages)
      .where(
        and(
          eq(unreadMessages.chat_member_id, chat_member_id),
          eq(unreadMessages.chat_room_id, chat_room_id)
        )
      )
      .limit(1);

    return result;
  }

  public async create(payload: CreateUnreadMessage, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(unreadMessages)
      .values({
        total_count: payload.total_count,
        chat_member_id: payload.chat_member_id,
        chat_room_id: payload.chat_room_id,
      })
      .returning();
    return result;
  }

  public async update(id: string, count: number, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    return await client
      .update(unreadMessages)
      .set({
        total_count: count,
      })
      .where(eq(unreadMessages.id, id));
  }
}
