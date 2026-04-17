import { db } from "@/db";
import { IdentityRole } from "@/core/types/base.type";
import {
  NotFoundException,
  UnauthorizedException,
} from "@/core/response/error/exception";
import { ChatMemberRoleEnum } from "@/modules/chat-member/model/chat-member.enum";
import { UserRepository } from "@/modules/users/user.repository";
import { UserService } from "@/modules/users/user.service";
import { WSEventType, WSReceiver } from "@/enum/ws-event.enum";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import { UnreadMessageService } from "./unread-message.service";
import { WSService } from "./ws.service";
import type {
  ChangeChatRoomName,
  ChatRoomFilter,
  CreateChatRoom,
} from "@/types/chat-room.type";
import { getPaginationMeta } from "@/utils/pagination";

export class ChatRoomService {
  private chatRoomRepository: ChatRoomRepository;
  private chatMemberRepository: ChatMemberRepository;
  private userRepository: UserRepository;
  private userService: UserService;
  private unreadMessageService: UnreadMessageService;
  private wsService: WSService;

  constructor() {
    this.chatRoomRepository = new ChatRoomRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.userRepository = new UserRepository();
    this.userService = new UserService();
    this.unreadMessageService = new UnreadMessageService();
    this.wsService = new WSService();
  }

  public async findMember(id: string) {
    const user = await this.userRepository.findById(id);
    if (user) {
      return { type: IdentityRole.USER, entity: user };
    }
    throw new NotFoundException();
  }

  public async findAll(filter: ChatRoomFilter) {
    const count = await this.chatRoomRepository.count(filter);
    const meta = getPaginationMeta(filter, count);
    const chatRooms = await this.chatRoomRepository.findAll(filter);
    return {
      data: chatRooms,
      meta,
    };
  }

  public async findById(id: string, filter: ChatRoomFilter) {
    return this.chatRoomRepository.findById(id, filter);
  }

  public async findUserChatRoom(token: string, filter: ChatRoomFilter) {
    const user = await this.userService.getMe(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    const count = await this.chatRoomRepository.countUser(
      user.id as string,
      filter,
    );
    const meta = getPaginationMeta(filter, count);
    const chatRooms = await this.chatRoomRepository.findUserChatRoom(
      user.id as string,
      filter,
    );
    return {
      data: chatRooms,
      meta,
    };
  }

  public async create(payload: CreateChatRoom) {
    if (!payload.chat_members) {
      return this.chatRoomRepository.create(payload);
    }

    return db.transaction(async (tx) => {
      const chatRoom = await this.chatRoomRepository.create(payload, tx);
      const chatMembers = await Promise.all(
        payload.chat_members!.map(async (memberId) => {
          const member = await this.findMember(memberId);
          const chatMember = await this.chatMemberRepository.create(
            {
              chat_room_id: chatRoom.id,
              user_id: member.entity.id,
              role: ChatMemberRoleEnum.MEMBER,
            },
            tx,
          );
          await this.unreadMessageService.create(
            {
              chat_member_id: chatMember.id,
              chat_room_id: chatRoom.id,
              total_count: 0,
            },
            tx,
          );
          await this.wsService.broadcastToOne(
            member.entity.id,
            WSReceiver.MEMBER,
            WSEventType.CHAT_ROOM_CREATED,
            chatRoom,
          );
          return chatMember;
        }),
      );

      return {
        ...chatRoom,
        chat_members: chatMembers,
      };
    });
  }

  public async changeName(id: string, payload: ChangeChatRoomName) {
    return this.chatRoomRepository.changeName(id, payload);
  }
}
