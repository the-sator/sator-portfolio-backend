import prisma from "@/loaders/prisma";
import type { CreateChatMessage } from "@/types/chat-message.type";

export class ChatMessageRepository {
  public async findAll() {
    return await prisma.chatMessage.findMany();
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

  public async create(payload: CreateChatMessage) {
    return await prisma.chatMessage.create({
      data: {
        content: payload.content,
        chat_member_id: payload.chat_member_id,
        chat_room_id: payload.chat_room_id,
        message_type: payload.message_type,
      },
    });
  }
}
