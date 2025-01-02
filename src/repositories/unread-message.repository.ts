import prisma from "@/loaders/prisma";
import type { CreateUnreadMessage } from "@/types/unread-message.type";
import type { Prisma } from "@prisma/client";

export class UnreadMessageRepository {
  public async findAll() {
    return await prisma.unreadMessage.findMany();
  }

  public async findByMember(chat_room_id: string, auth_id: string) {
    return await prisma.unreadMessage.findFirst({
      where: {
        chat_room_id,
        OR: [
          {
            chat_member: {
              admin_id: auth_id,
            },
          },
          {
            chat_member: {
              user_id: auth_id,
            },
          },
        ],
      },
    });
  }
  public async findByAuthId(auth_id: string) {
    return await prisma.unreadMessage.findMany({
      where: {
        chat_member: {
          OR: [
            {
              admin_id: auth_id,
            },
            {
              user_id: auth_id,
            },
          ],
        },
      },
    });
  }

  public async checkIfExist(chat_room_id: string, chat_member_id: string) {
    return await prisma.unreadMessage.findFirst({
      where: {
        chat_member_id,
        chat_room_id,
      },
    });
  }

  public async create(
    payload: CreateUnreadMessage,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.unreadMessage.create({
      data: {
        total_count: payload.total_count,
        chat_member_id: payload.chat_member_id,
        chat_room_id: payload.chat_room_id,
      },
    });
  }

  public async update(
    id: string,
    count: number,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.unreadMessage.update({
      where: { id },
      data: {
        total_count: count,
      },
    });
  }
}
