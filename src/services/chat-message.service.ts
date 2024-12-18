import { AdminAuth } from "@/authentication/admin.auth";
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
import type { Request } from "express";

export class ChatMessageService {
  private chatMessageRepository: ChatMessageRepository;
  private chatMemberRepository: ChatMemberRepository;
  private adminAuth: AdminAuth;
  constructor() {
    this.chatMessageRepository = new ChatMessageRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.adminAuth = new AdminAuth();
  }
  public async findAll() {
    return this.chatMessageRepository.findAll();
  }

  public async findByRoomId(req: Request, id: string) {
    const { admin } = await this.adminAuth.getAdmin(req);
    if (!admin) {
      return ThrowUnauthorized();
    }
    const member = await this.chatMemberRepository.isMember(admin.id!, id);
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
    const { admin } = await this.adminAuth.getAdmin(req);
    if (!admin) {
      return ThrowUnauthorized();
    }
    const member = await this.chatMemberRepository.isMember(admin.id!, id);
    if (!member) {
      return ThrowUnauthorized("You are not a member of the chat room");
    }

    const count = await this.chatMessageRepository.count(id);
    const current_page = filter.page ? Number(filter.page) : 1;
    const page_size = filter.limit ? Number(filter.limit) : LIMIT;
    const page_count = Math.ceil(count / page_size);
    const page = count > current_page * page_size ? current_page + 1 : null;
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
