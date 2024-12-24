import { UserAuth } from "@/authentication/user.auth";
import prisma from "@/loaders/prisma";
import { AdminRepository } from "@/repositories/admin.repository";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import { UserRepository } from "@/repositories/user.repository";
import type {
  ChangeChatRoomName,
  CreateChatRoom,
} from "@/types/chat-room.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import { ChatMemberRole } from "@prisma/client";
import type { Request } from "express";
import { ChatMemberService } from "./chat-member.service";

export class ChatRoomService {
  private chatRoomRepository: ChatRoomRepository;
  private chatMemberRepository: ChatMemberRepository;
  private chatMemberService: ChatMemberService;
  private userAuth: UserAuth;
  constructor() {
    this.chatRoomRepository = new ChatRoomRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.chatMemberService = new ChatMemberService();
    this.userAuth = new UserAuth();
  }

  public async findAll() {
    return this.chatRoomRepository.findAll();
  }

  public async findById(id: string) {
    return this.chatRoomRepository.findById(id);
  }

  public async findUserChatRoom(req: Request) {
    const { auth } = await this.userAuth.getUser(req);
    if (!auth) {
      return ThrowUnauthorized();
    }
    return this.chatRoomRepository.findUserChatRoom(auth.id!);
  }

  public async create(payload: CreateChatRoom) {
    if (payload.chat_members) {
      return await prisma.$transaction(async (tx) => {
        const chatRoom = await this.chatRoomRepository.create(payload, tx);

        const memberPromises = payload.chat_members!.map(async (memberId) => {
          const member = await this.chatMemberService.findMember(memberId);
          return this.chatMemberRepository.create(
            {
              chat_room_id: chatRoom.id,
              admin_id: member.type === "ADMIN" ? member.entity.id : undefined,
              user_id: member.type === "USER" ? member.entity.id : undefined,
              role:
                member.type === "USER"
                  ? ChatMemberRole.MEMBER
                  : ChatMemberRole.ADMIN,
            },
            tx
          );
        });

        await Promise.all(memberPromises);

        return chatRoom;
      });
    }
    return this.chatRoomRepository.create(payload);
  }

  public async changeName(id: string, payload: ChangeChatRoomName) {
    return this.chatRoomRepository.changeName(id, payload);
  }
}
