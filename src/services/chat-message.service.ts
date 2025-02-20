import prisma from "@/loaders/prisma";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatMessageRepository } from "@/repositories/chat-message.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import type {
  ChatMessageFilter,
  CreateChatMessage,
} from "@/types/chat-message.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import { getPaginationMetadata } from "@/utils/pagination";
import type { Request } from "express";
import { WSEventType, WSReceiver } from "@/enum/ws-event.enum";
import { WSService } from "./ws.service";
import { UnreadMessageService } from "./unread-message.service";
import { UserService } from "./user.service";
import { AdminService } from "./admin.service";
import { getAdminCookie, getUserCookie } from "@/utils/cookie";
import config from "@/config/environment";

export class ChatMessageService {
  private chatMessageRepository: ChatMessageRepository;
  private chatMemberRepository: ChatMemberRepository;
  private chatRoomRepository: ChatRoomRepository;
  private unreadMessageService: UnreadMessageService;
  private adminService: AdminService;
  private userService: UserService;
  private wsService: WSService;
  constructor() {
    this.chatMessageRepository = new ChatMessageRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.chatRoomRepository = new ChatRoomRepository();
    this.adminService = new AdminService();
    this.userService = new UserService();
    this.wsService = new WSService();
    this.unreadMessageService = new UnreadMessageService();
  }
  public async findAll() {
    return this.chatMessageRepository.findAll();
  }

  public async findByRoomId(token: string, id: string) {
    const admin = await this.adminService.getMe(token);
    if (!admin) {
      return ThrowUnauthorized();
    }
    const member = await this.chatMemberRepository.isMemberActive(admin.id, id);
    if (!member) {
      return ThrowUnauthorized("You are not a member of the chat room");
    }
    const messages = this.chatMessageRepository.findByRoomId(id);
    return messages;
  }

  public async paginateByRoomId(
    req: Request,
    id: string,
    filter: ChatMessageFilter
  ) {
    const isAdminRoute = `${config.api.prefix}/admin`;
    const sessionToken = isAdminRoute
      ? getAdminCookie(req)
      : getUserCookie(req);
    const auth = isAdminRoute
      ? await this.adminService.getMe(sessionToken)
      : await this.userService.getMe(sessionToken);
    if (!auth) {
      return ThrowUnauthorized();
    }
    const member = await this.chatMemberRepository.isMemberActive(auth.id!, id);
    if (!member) {
      return ThrowUnauthorized("You are not a member of the chat room");
    }

    const count = await this.chatMessageRepository.count(id);
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const messages = await this.chatMessageRepository.paginateByRoomId(
      id,
      filter
    );
    return { messages, page, page_count, page_size, current_page };
  }

  public async create(payload: CreateChatMessage) {
    return prisma.$transaction(async (tx) => {
      const members = await this.chatMemberRepository.findByRoomId(
        payload.chat_room_id
      );
      // Remove the sender id
      const authIds = members.map(
        (member) => member.user_id || member.admin_id || ""
      );

      const message = await this.chatMessageRepository.create(payload, tx);
      const authIdsExcludeSender = members
        .filter((member) => member.id !== payload.chat_member_id)
        .map((member) => member.user_id || member.admin_id || "");
      for (const id of authIdsExcludeSender) {
        const unread = await this.unreadMessageService.findByMember(
          payload.chat_room_id,
          id
        );
        if (!unread) return ThrowInternalServer();
        await this.unreadMessageService.updateUnread(
          unread.id,
          (unread.total_count += 1)
        );
      }

      const updatedRoom = await this.chatRoomRepository.bumpToLatest(
        payload.chat_room_id,
        message.id,
        tx
      );

      await this.wsService.broadcastToMany(
        authIds,
        WSReceiver.MEMBER,
        WSEventType.NEW_MESSAGE,
        message
      );

      this.wsService.broadcastToMany(
        authIds,
        WSReceiver.MEMBER,
        WSEventType.UPDATE_ROOM,
        updatedRoom
      );
      return message;
    });
  }
}
