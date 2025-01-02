import { AdminAuth } from "@/authentication/admin.auth";
import { UserAuth } from "@/authentication/user.auth";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import { UnreadMessageRepository } from "@/repositories/unread-message.repository";
import type { CreateUnreadMessage } from "@/types/unread-message.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import type { Prisma } from "@prisma/client";
import type { Request } from "express";

export class UnreadMessageService {
  private unreadMessageRepository: UnreadMessageRepository;
  private chatRoomRepository: ChatRoomRepository;
  private adminAuth: AdminAuth;
  private userAuth: UserAuth;
  constructor() {
    this.unreadMessageRepository = new UnreadMessageRepository();
    this.chatRoomRepository = new ChatRoomRepository();
    this.userAuth = new UserAuth();
    this.adminAuth = new AdminAuth();
  }
  public async findAll() {
    return this.unreadMessageRepository.findAll();
  }

  public async findByMember(chat_room_id: string, auth_id: string) {
    return this.unreadMessageRepository.findByMember(chat_room_id, auth_id);
  }

  public async findByAuth(req: Request) {
    const isAdminRoute = req.originalUrl.startsWith("/api/admin");
    const { auth } = isAdminRoute
      ? await this.adminAuth.getAdmin(req)
      : await this.userAuth.getUser(req);
    if (!auth) return ThrowUnauthorized();
    const unreadMessages = await this.unreadMessageRepository.findByAuthId(
      auth.id!
    );
    return unreadMessages;
  }

  public async create(
    payload: CreateUnreadMessage,
    tx?: Prisma.TransactionClient
  ) {
    const unreadRecord = await this.unreadMessageRepository.checkIfExist(
      payload.chat_room_id,
      payload.chat_member_id
    );
    if (unreadRecord) return ThrowInternalServer("Record Already Exist");
    return this.unreadMessageRepository.create(payload, tx);
  }

  public async updateUnread(id: string, count: number) {
    return this.unreadMessageRepository.update(id, count);
  }
}
