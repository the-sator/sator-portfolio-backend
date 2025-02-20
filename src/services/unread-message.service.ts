import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import { UnreadMessageRepository } from "@/repositories/unread-message.repository";
import type { CreateUnreadMessage } from "@/types/unread-message.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import type { Prisma } from "@prisma/client";
import type { Request } from "express";
import { UserService } from "./user.service";
import { AdminService } from "./admin.service";
import { getAdminCookie, getUserCookie } from "@/utils/cookie";
import config from "@/config/environment";

export class UnreadMessageService {
  private unreadMessageRepository: UnreadMessageRepository;
  private chatRoomRepository: ChatRoomRepository;
  private userService: UserService;
  private adminService: AdminService;
  constructor() {
    this.unreadMessageRepository = new UnreadMessageRepository();
    this.chatRoomRepository = new ChatRoomRepository();
    this.userService = new UserService();
    this.adminService = new AdminService();
  }
  public async findAll() {
    return this.unreadMessageRepository.findAll();
  }

  public async findByMember(chat_room_id: string, auth_id: string) {
    return this.unreadMessageRepository.findByMember(chat_room_id, auth_id);
  }

  public async findByAuth(req: Request) {
    const isAdminRoute = req.originalUrl.startsWith(
      `${config.api.prefix}/admin`
    );
    const sessionToken = isAdminRoute
      ? getAdminCookie(req)
      : getUserCookie(req);
    const auth = isAdminRoute
      ? await this.adminService.getMe(sessionToken)
      : await this.userService.getMe(sessionToken);
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
