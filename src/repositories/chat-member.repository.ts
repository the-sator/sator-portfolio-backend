import prisma from "@/loaders/prisma";
import type { CreateChatMember } from "@/types/chat-member.type";

export class ChatMemberRepository {
  public async findAll() {
    return await prisma.chatMember.findMany();
  }
  public async findByRoomId(id: string) {
    return await prisma.chatMember.findMany({
      where: { id },
    });
  }

  public async isMember(id: string, roomId: string) {
    return await prisma.chatMember.findFirst({
      where: {
        OR: [{ admin_id: id }, { user_id: id }],
        AND: [{ chat_room_id: roomId }],
      },
    });
  }

  public async create(payload: CreateChatMember) {
    return await prisma.chatMember.create({
      data: {
        admin_id: payload.admin_id,
        user_id: payload.user_id,
        chat_room_id: payload.chat_room_id,
        role: payload.role,
      },
    });
  }
}
