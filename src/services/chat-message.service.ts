import { AdminAuth } from "@/authentication/admin.auth";
import { UserAuth } from "@/authentication/user.auth";
import prisma from "@/loaders/prisma";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatMessageRepository } from "@/repositories/chat-message.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import { io } from "@/loaders/socket";
import type {
  ChatMessageFilter,
  CreateChatMessage,
} from "@/types/chat-message.type";
import { ThrowUnauthorized } from "@/utils/exception";
import { getPaginationMetadata } from "@/utils/pagination";
import type { Request } from "express";
import { WSEvent } from "@/enum/ws-event.enum";

export class ChatMessageService {
  private chatMessageRepository: ChatMessageRepository;
  private chatMemberRepository: ChatMemberRepository;
  private chatRoomRepository: ChatRoomRepository;
  private adminAuth: AdminAuth;
  private userAuth: UserAuth;
  constructor() {
    this.chatMessageRepository = new ChatMessageRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.chatRoomRepository = new ChatRoomRepository();
    this.userAuth = new UserAuth();
    this.adminAuth = new AdminAuth();
  }
  public async findAll() {
    return this.chatMessageRepository.findAll();
  }

  public async findByRoomId(req: Request, id: string) {
    const { auth } = await this.adminAuth.getAdmin(req);
    if (!auth) {
      return ThrowUnauthorized();
    }
    const member = await this.chatMemberRepository.isMemberActive(auth.id, id);
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
    const isAdminRoute = req.originalUrl.startsWith("/api/admin");
    const { auth } = isAdminRoute
      ? await this.adminAuth.getAdmin(req)
      : await this.userAuth.getUser(req);
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
      const message = await this.chatMessageRepository.create(payload, tx);
      const updatedRoom = await this.chatRoomRepository.bumpToLatest(
        payload.chat_room_id,
        tx
      );
      io.emit(`chat-room:${message.chat_room_id}`, message);
      io.emit(WSEvent.ADMIN_UPDATE_ROOM, updatedRoom);
      return message;
    });
  }
}
