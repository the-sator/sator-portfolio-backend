import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import { UnreadMessageRepository } from "@/repositories/unread-message.repository";
import type { CreateUnreadMessage } from "@/types/unread-message.type";
import type { Request } from "express";
import { UserService } from "../modules/users/user.service";
import { env } from "@/libs";
import {
  InternalServerException,
  UnauthorizedException,
} from "@/core/response/error/exception";
import { cookie, COOKIE_ENTITY } from "@/libs/cookie";
import type { DrizzleTransaction } from "@/db";

export class UnreadMessageService {
  private unreadMessageRepository: UnreadMessageRepository;
  private chatRoomRepository: ChatRoomRepository;
  private userService: UserService;
  constructor() {
    this.unreadMessageRepository = new UnreadMessageRepository();
    this.chatRoomRepository = new ChatRoomRepository();
    this.userService = new UserService();
  }
  public async findAll() {
    return this.unreadMessageRepository.findAll();
  }

  public async findByMember(chat_room_id: string, auth_id: string) {
    return this.unreadMessageRepository.findByMember(chat_room_id, auth_id);
  }

  public async findByAuth(req: Request) {
    const isAdminRoute = req.originalUrl.startsWith(`${env.API_PREFIX}/admin`);
    const sessionToken = isAdminRoute
      ? cookie.get(req, COOKIE_ENTITY.ADMIN)
      : cookie.get(req, COOKIE_ENTITY.USER);
    const auth = await this.userService.getMe(sessionToken);
    if (!auth) throw new UnauthorizedException();
    const unreadMessages = await this.unreadMessageRepository.findByAuthId(
      auth.id as string
    );
    return unreadMessages;
  }

  public async create(payload: CreateUnreadMessage, tx?: DrizzleTransaction) {
    const unreadRecord = await this.unreadMessageRepository.checkIfExist(
      payload.chat_room_id,
      payload.chat_member_id
    );
    if (unreadRecord)
      throw new InternalServerException({ message: "Record Already Exist" });
    return this.unreadMessageRepository.create(payload, tx);
  }

  public async updateUnread(id: string, count: number) {
    return this.unreadMessageRepository.update(id, count);
  }
}
