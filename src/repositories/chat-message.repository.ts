import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type {
  ChatMessageFilter,
  CreateChatMessage,
} from "@/types/chat-message.type";
import type { Prisma } from "@prisma/client";

export class ChatMessageRepository {
  public async findAll() {
    return await prisma.chatMessage.findMany();
  }

  public async paginateByRoomId(id: string, filter: ChatMessageFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    return await prisma.chatMessage.findMany({
      where: { chat_room_id: id },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        chat_member: {
          include: {
            admin: true,
            user: true,
          },
        },
      },
    });
  }

  public async findByRoomId(id: string) {
    return await prisma.chatMessage.findMany({
      where: { chat_room_id: id },
      include: {
        chat_member: {
          include: {
            admin: true,
            user: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  public async count(id: string) {
    return await prisma.chatMessage.count({
      where: { chat_room_id: id },
    });
  }

  public async create(
    payload: CreateChatMessage,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.chatMessage.create({
      data: {
        content: payload.content,
        chat_member_id: payload.chat_member_id,
        chat_room_id: payload.chat_room_id,
        message_type: payload.message_type,
        media: payload.media,
      },

      include: {
        chat_member: {
          include: {
            admin: true,
            user: true,
          },
        },
      },
    });
  }
}
