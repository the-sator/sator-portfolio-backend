import { UserAuth } from "@/authentication/user.auth";
import prisma from "@/loaders/prisma";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import type {
  ChangeChatRoomName,
  ChatRoomFilter,
  CreateChatRoom,
} from "@/types/chat-room.type";
import { ThrowUnauthorized } from "@/utils/exception";
import { ChatMemberRole } from "@prisma/client";
import type { Request } from "express";
import { ChatMemberService } from "./chat-member.service";
import { getPaginationMetadata } from "@/utils/pagination";
import { WSEventType, WSReceiver } from "@/enum/ws-event.enum";
import { WSService } from "./ws.service";
import { UnreadMessageService } from "./unread-message.service";

export class ChatRoomService {
  private chatRoomRepository: ChatRoomRepository;
  private chatMemberRepository: ChatMemberRepository;
  private chatMemberService: ChatMemberService;
  private unreadMessageService: UnreadMessageService;
  private wsService: WSService;
  private userAuth: UserAuth;
  constructor() {
    this.chatRoomRepository = new ChatRoomRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.chatMemberService = new ChatMemberService();
    this.unreadMessageService = new UnreadMessageService();
    this.wsService = new WSService();
    this.userAuth = new UserAuth();
  }

  public async findAll(filter: ChatRoomFilter) {
    const count = await this.chatRoomRepository.count(filter);
    const { page, current_page, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const chatRooms = await this.chatRoomRepository.findAll(filter);
    return {
      data: chatRooms,
      metadata: { count, page, current_page, page_size },
    };
  }

  public async findById(id: string, filter: ChatRoomFilter) {
    return this.chatRoomRepository.findById(id, filter);
  }

  public async findUserChatRoom(req: Request, filter: ChatRoomFilter) {
    const { auth } = await this.userAuth.getUser(req);

    if (!auth) {
      return ThrowUnauthorized();
    }
    const count = await this.chatRoomRepository.countUser(auth.id!, filter);
    const { page, current_page, page_size } = getPaginationMetadata(
      filter,
      count
    );

    const chatRooms = await this.chatRoomRepository.findUserChatRoom(
      auth.id!,
      filter
    );

    return {
      data: chatRooms,
      metadata: { count, page, current_page, page_size },
    };
  }

  public async create(payload: CreateChatRoom) {
    if (payload.chat_members) {
      return await prisma.$transaction(async (tx) => {
        const chatRoom = await this.chatRoomRepository.create(payload, tx);

        const memberPromises = payload.chat_members!.map(async (memberId) => {
          const member = await this.chatMemberService.findMember(memberId);
          const chatMember = await this.chatMemberRepository.create(
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
          // Ensure chatMember is created before creating unreadMessage
          await this.unreadMessageService.create(
            {
              chat_member_id: chatMember.id,
              chat_room_id: chatRoom.id,
              total_count: 0,
            },
            tx
          );

          this.wsService.broadcastToOne(
            member.entity.id,
            WSReceiver.MEMBER,
            WSEventType.CHAT_ROOM_CREATED,
            chatRoom
          );

          return chatMember;
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
