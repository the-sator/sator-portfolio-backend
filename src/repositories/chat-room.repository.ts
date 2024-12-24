import prisma from "@/loaders/prisma";
import type { InviteChatMember } from "@/types/chat-member.type";
import type {
  ChangeChatRoomName,
  CreateChatRoom,
} from "@/types/chat-room.type";
import type { Prisma } from "@prisma/client";

export class ChatRoomRepository {
  public async findAll() {
    return await prisma.chatRoom.findMany({
      orderBy: {
        updated_at: "desc",
      },
    });
  }

  public async findUserChatRoom(user_id: string) {
    return await prisma.chatRoom.findMany({
      orderBy: {
        updated_at: "desc",
      },
      where: {
        chat_members: {
          some: {
            user_id: {
              startsWith: user_id,
            },
          },
        },
      },
    });
  }

  public async findById(id: string) {
    return await prisma.chatRoom.findFirst({
      where: { id },
      include: {
        chat_members: {
          orderBy: {
            role: "asc",
          },
          include: {
            admin: {
              omit: {
                password: true,
                totp_key: true,
              },
            },
            user: {
              omit: {
                password: true,
                totp_key: true,
              },
            },
          },
        },
      },
    });
  }

  public async create(payload: CreateChatRoom, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.chatRoom.create({
      data: {
        name: payload.name,
        is_group: payload.is_group || false,
      },
    });
  }

  public async changeName(
    id: string,
    payload: ChangeChatRoomName,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.chatRoom.update({
      data: {
        name: payload.name,
      },
      where: { id },
    });
  }

  public async bumpToLatest(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.chatRoom.update({
      data: {
        updated_at: new Date(),
      },
      where: { id },
    });
  }
}
