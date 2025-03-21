import prisma from "@/loaders/prisma";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import type {
  ChangeChatRoomName,
  ChatRoomFilter,
  CreateChatRoom,
} from "@/types/chat-room.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import { ChatMemberRole } from "@prisma/client";
import { getPaginationMetadata } from "@/utils/pagination";
import { WSEventType, WSReceiver } from "@/enum/ws-event.enum";
import { WSService } from "./ws.service";
import { UnreadMessageService } from "./unread-message.service";
import { UserService } from "./user.service";
import { AdminRepository } from "@/repositories/admin.repository";
import { UserRepository } from "@/repositories/user.repository";
import { IdentityRole } from "@/types/base.type";

export class ChatRoomService {
  private chatRoomRepository: ChatRoomRepository;
  private chatMemberRepository: ChatMemberRepository;
  private userRepository: UserRepository;
  private adminRepository: AdminRepository;
  private userService: UserService;
  private unreadMessageService: UnreadMessageService;
  private wsService: WSService;
  constructor() {
    this.chatRoomRepository = new ChatRoomRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.userRepository = new UserRepository();
    this.adminRepository = new AdminRepository();
    this.userService = new UserService();
    this.unreadMessageService = new UnreadMessageService();
    this.wsService = new WSService();
  }

  public async findMember(id: string) {
    const user = await this.userRepository.findById(id);
    if (user) {
      return { type: IdentityRole.USER, entity: user };
    }
    const admin = await this.adminRepository.findById(id);
    if (admin) {
      return { type: IdentityRole.ADMIN, entity: admin };
    }
    return ThrowInternalServer("Record cannot be found");
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

  public async findUserChatRoom(token: string, filter: ChatRoomFilter) {
    const user = await this.userService.getMe(token);

    if (!user) {
      return ThrowUnauthorized();
    }
    const count = await this.chatRoomRepository.countUser(user.id!, filter);
    const { page, current_page, page_size } = getPaginationMetadata(
      filter,
      count
    );

    const chatRooms = await this.chatRoomRepository.findUserChatRoom(
      user.id!,
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
          const member = await this.findMember(memberId);
          const chatMember = await this.chatMemberRepository.create(
            {
              chat_room_id: chatRoom.id,
              admin_id:
                member.type === IdentityRole.ADMIN
                  ? member.entity.id
                  : undefined,
              user_id:
                member.type === IdentityRole.USER
                  ? member.entity.id
                  : undefined,
              role:
                member.type === IdentityRole.USER
                  ? ChatMemberRole.MEMBER
                  : ChatMemberRole.ADMIN,
            },
            tx
          );
          chatRoom.chat_members.push(chatMember);
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
