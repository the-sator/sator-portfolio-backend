import { AdminAuth } from "@/authentication/admin.auth";
import { UserAuth } from "@/authentication/user.auth";
import { LIMIT } from "@/constant/base";
import { AdminRepository } from "@/repositories/admin.repository";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatMessageRepository } from "@/repositories/chat-message.repository";
import { SessionRepository } from "@/repositories/session.repository";
import type {
  ChatMessageFilter,
  CreateChatMessage,
} from "@/types/chat-message.type";
import { ThrowUnauthorized } from "@/utils/exception";
import { getPaginationMetadata } from "@/utils/pagination";
import type { Request } from "express";

export class ChatMessageService {
  private chatMessageRepository: ChatMessageRepository;
  private chatMemberRepository: ChatMemberRepository;
  private adminAuth: AdminAuth;
  private userAuth: UserAuth;
  constructor() {
    this.chatMessageRepository = new ChatMessageRepository();
    this.chatMemberRepository = new ChatMemberRepository();
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
    const member = await this.chatMemberRepository.isMember(auth.id!, id);
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
    const member = await this.chatMemberRepository.isMember(auth.id!, id);
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
    return this.chatMessageRepository.create(payload);
  }
}
