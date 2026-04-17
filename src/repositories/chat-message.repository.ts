import { LIMIT } from "@/constant/base";
import { db, type DrizzleTransaction } from "@/db";
import { chatMembers, chatMessages, users } from "@/db/schema";
import type {
  ChatMessageFilter,
  CreateChatMessage,
} from "@/types/chat-message.type";
import { desc, eq } from "drizzle-orm";

export class ChatMessageRepository {
  private toMessage(row: {
    message: typeof chatMessages.$inferSelect;
    chat_member: typeof chatMembers.$inferSelect;
    user: typeof users.$inferSelect | null;
  }) {
    return {
      ...row.message,
      chat_member: {
        ...row.chat_member,
        user: row.user,
      },
    };
  }

  public async findAll() {
    return db.select().from(chatMessages);
  }

  public async paginateByRoomId(id: string, filter: ChatMessageFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.page_size ? Number(filter.page_size) : LIMIT;
    const rows = await db
      .select({
        message: chatMessages,
        chat_member: chatMembers,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(chatMembers, eq(chatMessages.chat_member_id, chatMembers.id))
      .leftJoin(users, eq(chatMembers.user_id, users.id))
      .where(eq(chatMessages.chat_room_id, id))
      .orderBy(desc(chatMessages.created_at))
      .limit(limit)
      .offset((page - 1) * limit);

    return rows.map((row) => this.toMessage(row));
  }

  public async findByRoomId(id: string) {
    const rows = await db
      .select({
        message: chatMessages,
        chat_member: chatMembers,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(chatMembers, eq(chatMessages.chat_member_id, chatMembers.id))
      .leftJoin(users, eq(chatMembers.user_id, users.id))
      .where(eq(chatMessages.chat_room_id, id))
      .orderBy(desc(chatMessages.created_at));

    return rows.map((row) => this.toMessage(row));
  }

  public async count(id: string) {
    const { count } = await import("drizzle-orm");
    const [result] = await db
      .select({ count: count() })
      .from(chatMessages)
      .where(eq(chatMessages.chat_room_id, id));
    return result.count;
  }

  public async create(
    payload: CreateChatMessage,
    metadata?: unknown,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [message] = await client
      .insert(chatMessages)
      .values({
        content: payload.content,
        chat_member_id: payload.chat_member_id,
        chat_room_id: payload.chat_room_id,
        message_type: payload.message_type,
        metadata,
        media: payload.media ?? [],
      })
      .returning();

    const [memberRow] = await client
      .select({
        chat_member: chatMembers,
        user: users,
      })
      .from(chatMembers)
      .leftJoin(users, eq(chatMembers.user_id, users.id))
      .where(eq(chatMembers.id, message.chat_member_id))
      .limit(1);

    return {
      ...message,
      chat_member: memberRow
        ? {
            ...memberRow.chat_member,
            user: memberRow.user,
          }
        : null,
    };
  }
}
