import { LIMIT } from "@/constant/base";
import { db, type DrizzleTransaction } from "@/db";
import {
  chatMembers,
  chatMessages,
  chatRooms,
  unreadMessages,
  users,
} from "@/db/schema";
import type {
  ChangeChatRoomName,
  ChatRoomFilter,
  CreateChatRoom,
} from "@/types/chat-room.type";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  type SQL,
} from "drizzle-orm";

export class ChatRoomRepository {
  private buildFilter = (filter: Partial<ChatRoomFilter>) => {
    const conditions: SQL[] = [];
    if (filter.chat_room_name) {
      conditions.push(ilike(chatRooms.name, `%${filter.chat_room_name}%`));
    }
    return conditions;
  };

  private async hydrateRoom(
    room: typeof chatRooms.$inferSelect,
    includeMembers = false,
  ) {
    const unreadRows = await db
      .select({
        unread_message: unreadMessages,
        chat_member: chatMembers,
      })
      .from(unreadMessages)
      .leftJoin(chatMembers, eq(unreadMessages.chat_member_id, chatMembers.id))
      .where(eq(unreadMessages.chat_room_id, room.id));

    const [lastMessageRow] = room.last_message_id
      ? await db
          .select({
            message: chatMessages,
            chat_member: chatMembers,
            user: users,
          })
          .from(chatMessages)
          .leftJoin(chatMembers, eq(chatMessages.chat_member_id, chatMembers.id))
          .leftJoin(users, eq(chatMembers.user_id, users.id))
          .where(eq(chatMessages.id, room.last_message_id))
          .limit(1)
      : [];

    const memberRows = includeMembers
      ? await db
          .select({
            chat_member: chatMembers,
            user: users,
          })
          .from(chatMembers)
          .leftJoin(users, eq(chatMembers.user_id, users.id))
          .where(
            and(
              eq(chatMembers.chat_room_id, room.id),
              isNull(chatMembers.left_at),
            ),
          )
          .orderBy(asc(chatMembers.role))
      : [];

    return {
      ...room,
      unread_messages: unreadRows.map((row) => ({
        ...row.unread_message,
        chat_member: row.chat_member,
      })),
      last_message: lastMessageRow
        ? {
            ...lastMessageRow.message,
            chat_member: lastMessageRow.chat_member
              ? {
                  ...lastMessageRow.chat_member,
                  user: lastMessageRow.user,
                }
              : null,
          }
        : null,
      chat_members: memberRows.map((row) => ({
        ...row.chat_member,
        user: row.user,
      })),
    };
  }

  public async findAll(filter: ChatRoomFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.page_size ? Number(filter.page_size) : LIMIT;
    const conditions = this.buildFilter(filter);
    const whereClause = conditions.length ? and(...conditions) : undefined;

    const rooms = await db
      .select()
      .from(chatRooms)
      .where(whereClause)
      .orderBy(desc(chatRooms.updated_at))
      .limit(limit)
      .offset((page - 1) * limit);

    return Promise.all(rooms.map((room) => this.hydrateRoom(room)));
  }

  public async findUserChatRoom(user_id: string, filter: ChatRoomFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.page_size ? Number(filter.page_size) : LIMIT;
    const conditions = this.buildFilter(filter);
    const userRoomIds = db
      .select({ chat_room_id: chatMembers.chat_room_id })
      .from(chatMembers)
      .where(
        and(eq(chatMembers.user_id, user_id), isNull(chatMembers.left_at)),
      );

    conditions.push(inArray(chatRooms.id, userRoomIds));
    const rooms = await db
      .select()
      .from(chatRooms)
      .where(and(...conditions))
      .orderBy(desc(chatRooms.updated_at))
      .limit(limit)
      .offset((page - 1) * limit);

    return Promise.all(rooms.map((room) => this.hydrateRoom(room)));
  }

  public async findById(id: string, filter: ChatRoomFilter) {
    const conditions = this.buildFilter(filter);
    conditions.push(eq(chatRooms.id, id));

    const [room] = await db
      .select()
      .from(chatRooms)
      .where(and(...conditions))
      .limit(1);

    return room ? this.hydrateRoom(room, true) : null;
  }

  public async findByAuthId(auth_id: string) {
    const userRoomIds = db
      .select({ chat_room_id: chatMembers.chat_room_id })
      .from(chatMembers)
      .where(eq(chatMembers.user_id, auth_id));

    return db.select().from(chatRooms).where(inArray(chatRooms.id, userRoomIds));
  }

  public async count(filter?: ChatRoomFilter) {
    const conditions = this.buildFilter(filter || {});
    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [result] = await db
      .select({ count: count() })
      .from(chatRooms)
      .where(whereClause);
    return result.count;
  }

  public async countUser(user_id: string, filter?: ChatRoomFilter) {
    const conditions = this.buildFilter(filter || {});
    const userRoomIds = db
      .select({ chat_room_id: chatMembers.chat_room_id })
      .from(chatMembers)
      .where(
        and(eq(chatMembers.user_id, user_id), isNull(chatMembers.left_at)),
      );

    conditions.push(inArray(chatRooms.id, userRoomIds));
    const [result] = await db
      .select({ count: count() })
      .from(chatRooms)
      .where(and(...conditions));
    return result.count;
  }

  public async create(payload: CreateChatRoom, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [room] = await client
      .insert(chatRooms)
      .values({
        name: payload.name,
        is_group: payload.is_group || false,
      })
      .returning();

    return {
      ...room,
      unread_messages: [],
      last_message: null,
      chat_members: [],
    };
  }

  public async changeName(
    id: string,
    payload: ChangeChatRoomName,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(chatRooms)
      .set({
        name: payload.name,
      })
      .where(eq(chatRooms.id, id))
      .returning();
    return result;
  }

  public async bumpToLatest(
    id: string,
    last_message_id?: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [room] = await client
      .update(chatRooms)
      .set({
        updated_at: new Date(),
        last_message_id,
      })
      .where(eq(chatRooms.id, id))
      .returning();
    return {
      ...room,
      unread_messages: [],
      last_message: null,
      chat_members: [],
    };
  }
}
