import { AdminAuth } from "@/authentication/admin.auth";
import { AdminRepository } from "@/repositories/admin.repository";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatMessageRepository } from "@/repositories/chat-message.repository";
import { SessionRepository } from "@/repositories/session.repository";
import type { CreateChatMessage } from "@/types/chat-message.type";
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

  public async create(payload: CreateChatMessage) {
    return this.chatMessageRepository.create(payload);
  }
}
