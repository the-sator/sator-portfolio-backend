import { db } from "@/db";
import {
  ForbiddenException,
  InternalServerException,
  UnauthorizedException,
} from "@/core/response/error/exception";
import { WSEventType, WSReceiver } from "@/enum/ws-event.enum";
import { UserService } from "@/modules/users/user.service";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatMessageRepository } from "@/repositories/chat-message.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import type {
  ChatMessageFilter,
  CreateChatMessage,
} from "@/types/chat-message.type";
import { getPaginationMeta } from "@/utils/pagination";
import { ChatRoomService } from "./chat-room.service";
import { UnreadMessageService } from "./unread-message.service";
import { WSService } from "./ws.service";

export class ChatMessageService {
  private chatMessageRepository: ChatMessageRepository;
  private chatMemberRepository: ChatMemberRepository;
  private chatRoomRepository: ChatRoomRepository;
  private userService: UserService;
  private unreadMessageService: UnreadMessageService;
  private chatRoomService: ChatRoomService;
  private wsService: WSService;

  constructor() {
    this.chatMessageRepository = new ChatMessageRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.chatRoomRepository = new ChatRoomRepository();
    this.userService = new UserService();
    this.unreadMessageService = new UnreadMessageService();
    this.chatRoomService = new ChatRoomService();
    this.wsService = new WSService();
  }

  public async findAll() {
    return this.chatMessageRepository.findAll();
  }

  public async findByRoomId(token: string, id: string) {
    const user = await this.userService.getMe(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    const member = await this.chatMemberRepository.isMemberActive(
      user.id as string,
      id,
    );
    if (!member) {
      throw new ForbiddenException({
        message: "You are not a member of the chat room",
      });
    }
    return this.chatMessageRepository.findByRoomId(id);
  }

  public async paginateByRoomId(
    token: string,
    id: string,
    filter: ChatMessageFilter,
    isAdmin: boolean,
  ) {
    void isAdmin;
    const user = await this.userService.getMe(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    const member = await this.chatMemberRepository.isMemberActive(
      user.id as string,
      id,
    );
    if (!member) {
      throw new ForbiddenException({
        message: "You are not a member of the chat room",
      });
    }
    const count = await this.chatMessageRepository.count(id);
    const meta = getPaginationMeta(filter, count);
    const messages = await this.chatMessageRepository.paginateByRoomId(
      id,
      filter,
    );
    return { data: messages, meta };
  }

  public async create(payload: CreateChatMessage, metadata?: unknown) {
    return db.transaction(async (tx) => {
      const members = await this.chatMemberRepository.findByRoomId(
        payload.chat_room_id,
        tx,
      );
      const message = await this.chatMessageRepository.create(
        payload,
        metadata,
        tx,
      );
      const authIds = members
        .map((member) => member.user_id)
        .filter((id): id is string => Boolean(id));
      const authIdsExcludeSender = members
        .filter((member) => member.id !== payload.chat_member_id)
        .map((member) => member.user_id)
        .filter((id): id is string => Boolean(id));

      for (const id of authIdsExcludeSender) {
        const unread = await this.unreadMessageService.findByMember(
          payload.chat_room_id,
          id,
          tx,
        );
        if (!unread) throw new InternalServerException();
        await this.unreadMessageService.updateUnread(
          unread.id,
          (unread.total_count ?? 0) + 1,
          tx,
        );
      }

      const updatedRoom = await this.chatRoomRepository.bumpToLatest(
        payload.chat_room_id,
        message.id,
        tx,
      );
      await this.wsService.broadcastToMany(
        authIds,
        WSReceiver.MEMBER,
        WSEventType.NEW_MESSAGE,
        message,
      );
      await this.wsService.broadcastToMany(
        authIds,
        WSReceiver.MEMBER,
        WSEventType.UPDATE_ROOM,
        updatedRoom,
      );
      return message;
    });
  }
}
