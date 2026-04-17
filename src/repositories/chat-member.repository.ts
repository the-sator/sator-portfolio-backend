import { db, type DrizzleTransaction } from "@/db";
import { chatMembers, users } from "@/db/schema";
import type { CreateChatMember } from "@/types/chat-member.type";
import { and, eq, isNull, or } from "drizzle-orm";

export class ChatMemberRepository {
  public async findAll() {
    return db
      .select()
      .from(chatMembers)
      .where(isNull(chatMembers.left_at));
  }

  public async findById(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .select()
      .from(chatMembers)
      .where(and(eq(chatMembers.id, id), isNull(chatMembers.left_at)))
      .limit(1);
    return result || null;
  }

  public async findByUser(
    user_id: string,
    chat_room_id: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .select()
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.user_id, user_id),
          eq(chatMembers.chat_room_id, chat_room_id),
          isNull(chatMembers.left_at),
        ),
      )
      .limit(1);
    return result || null;
  }

  public async findByAdmin(
    admin_id: string,
    chat_room_id: string,
    tx?: DrizzleTransaction,
  ) {
    void admin_id;
    void chat_room_id;
    void tx;
    return null;
  }

  public async findByAuthId(auth_id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .select()
      .from(chatMembers)
      .where(eq(chatMembers.user_id, auth_id))
      .limit(1);
    return result || null;
  }

  public async findByRoomId(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    return client
      .select()
      .from(chatMembers)
      .where(and(eq(chatMembers.chat_room_id, id), isNull(chatMembers.left_at)));
  }

  public async isMemberActive(
    id: string,
    roomId: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .select()
      .from(chatMembers)
      .where(
        and(
          or(eq(chatMembers.user_id, id)),
          eq(chatMembers.chat_room_id, roomId),
          isNull(chatMembers.left_at),
        ),
      )
      .limit(1);
    return result || null;
  }

  public async isMember(
    id: string,
    roomId: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .select()
      .from(chatMembers)
      .where(
        and(or(eq(chatMembers.user_id, id)), eq(chatMembers.chat_room_id, roomId)),
      )
      .limit(1);
    return result || null;
  }

  public async create(
    payload: CreateChatMember,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [member] = await client
      .insert(chatMembers)
      .values({
        user_id: payload.user_id,
        chat_room_id: payload.chat_room_id,
        role: payload.role,
      })
      .returning();

    const [user] = member.user_id
      ? await client
          .select()
          .from(users)
          .where(eq(users.id, member.user_id))
          .limit(1)
      : [];

    return {
      ...member,
      user,
    };
  }

  public async remove(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .delete(chatMembers)
      .where(eq(chatMembers.id, id))
      .returning();
    return result;
  }

  public async softDelete(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [member] = await client
      .update(chatMembers)
      .set({
        left_at: new Date(),
      })
      .where(eq(chatMembers.id, id))
      .returning();

    const [user] = member.user_id
      ? await client
          .select()
          .from(users)
          .where(eq(users.id, member.user_id))
          .limit(1)
      : [];

    return {
      ...member,
      user,
    };
  }

  public async restore(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [member] = await client
      .update(chatMembers)
      .set({
        left_at: null,
      })
      .where(eq(chatMembers.id, id))
      .returning();

    const [user] = member.user_id
      ? await client
          .select()
          .from(users)
          .where(eq(users.id, member.user_id))
          .limit(1)
      : [];

    return {
      ...member,
      user,
    };
  }
}
