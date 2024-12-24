import prisma from "@/loaders/prisma";
import type { CreateChatMember } from "@/types/chat-member.type";
import type { Prisma } from "@prisma/client";

export class ChatMemberRepository {
  public async findAll() {
    return await prisma.chatMember.findMany({
      where: {
        left_at: null,
      },
    });
  }
  public async findById(id: string) {
    return await prisma.chatMember.findUnique({
      where: {
        id,
        left_at: null,
      },
    });
  }

  public async findByAdmin(admin_id: string) {
    return await prisma.chatMember.findFirst({
      where: {
        admin_id,
        left_at: null,
      },
    });
  }
  public async findByRoomId(id: string) {
    return await prisma.chatMember.findMany({
      where: {
        chat_room_id: id,
        left_at: null,
      },
    });
  }

  public async isMember(id: string, roomId: string) {
    return await prisma.chatMember.findFirst({
      where: {
        OR: [{ admin_id: id }, { user_id: id }],
        AND: [
          {
            chat_room_id: roomId,
            left_at: null,
          },
        ],
      },
    });
  }

  public async create(
    payload: CreateChatMember,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.chatMember.create({
      data: {
        admin_id: payload.admin_id,
        user_id: payload.user_id,
        chat_room_id: payload.chat_room_id,
        role: payload.role,
      },
    });
  }

  public async remove(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.chatMember.delete({
      where: {
        id,
      },
    });
  }

  public async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.chatMember.update({
      where: {
        id,
      },
      data: {
        left_at: new Date(),
      },
    });
  }
}
