import prisma from "@/loaders/prisma";
import type { CreateChatRoom } from "@/types/chat-room.type";

export class ChatRoomRepository {
  public async findAll() {
    return await prisma.chatRoom.findMany();
  }

  public async findById(id: string) {
    return await prisma.chatRoom.findFirst({
      where: { id },
      include: {
        chat_members: true,
      },
    });
  }

  public async create(payload: CreateChatRoom) {
    return await prisma.chatRoom.create({
      data: {
        name: payload.name,
        is_group: payload.is_group || false,
      },
    });
  }
}
