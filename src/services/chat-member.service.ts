import { db } from "@/db";
import {
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "@/core/response/error/exception";
import { cookie, COOKIE_ENTITY } from "@/libs/cookie";
import { ChatMemberRoleEnum } from "@/modules/chat-member/model/chat-member.enum";
import { ChatMessageTypeEnum } from "@/modules/chat-messages/model/chat-message.enum";
import { UserRepository } from "@/modules/users/user.repository";
import { UserService } from "@/modules/users/user.service";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import type {
  CreateChatMember,
  InviteChatMember,
} from "@/types/chat-member.type";
import type { Request } from "express";
import { ChatMessageService } from "./chat-message.service";
import { UnreadMessageService } from "./unread-message.service";

type ChatMemberWithUser = {
  id: string;
  chat_room_id: string;
  user_id?: string | null;
  user?: { username: string } | null;
};

export class ChatMemberService {
  private chatMemberRepository: ChatMemberRepository;
  private userRepository: UserRepository;
  private userService: UserService;
  private chatMessageService: ChatMessageService;
  private unreadMessageService: UnreadMessageService;

  constructor() {
    this.chatMemberRepository = new ChatMemberRepository();
    this.userRepository = new UserRepository();
    this.userService = new UserService();
    this.chatMessageService = new ChatMessageService();
    this.unreadMessageService = new UnreadMessageService();
  }

  public async findAll() {
    return this.chatMemberRepository.findAll();
  }

  public async findByRoomId(id: string) {
    return this.chatMemberRepository.findByRoomId(id);
  }

  public async findMember(id: string) {
    const user = await this.userRepository.findById(id);
    if (user) {
      return { type: "USER", entity: user };
    }
    throw new NotFoundException();
  }

  public async findAllInvitableMember(id?: string) {
    const users = await this.userRepository.findAll();
    if (!id) {
      return { users, admins: [] };
    }

    const members = await this.chatMemberRepository.findByRoomId(id);
    const userMemberIds = new Set(members.map((member) => member.user_id));
    const sanitizedUsers = users.filter((user) => !userMemberIds.has(user.id));
    return { users: sanitizedUsers, admins: [] };
  }

  public async invite(payload: InviteChatMember) {
    const members = await Promise.all(
      payload.chat_members.map(async (memberId) => {
        const member = await this.findMember(memberId);
        const chatMember = await this.chatMemberRepository.create({
          chat_room_id: payload.chat_room_id,
          user_id: member.entity.id,
          role: ChatMemberRoleEnum.MEMBER,
        });
        await this.unreadMessageService.create({
          chat_member_id: chatMember.id,
          chat_room_id: payload.chat_room_id,
          total_count: 0,
        });
        await this.broadcastInvite(chatMember);
        return chatMember;
      }),
    );
    return members;
  }

  public async join(payload: CreateChatMember) {
    const id = payload.user_id || payload.admin_id;
    if (!id) {
      throw new ForbiddenException({
        message: "User ID Cannot Be Empty",
      });
    }

    const chatMember = await db.transaction(async (tx) => {
      const member = await this.chatMemberRepository.isMember(
        id,
        payload.chat_room_id,
        tx,
      );
      if (member && member.left_at) {
        return this.chatMemberRepository.restore(member.id, tx);
      }
      return this.chatMemberRepository.create(
        {
          ...payload,
          user_id: id,
          role: payload.role || ChatMemberRoleEnum.MEMBER,
        },
        tx,
      );
    });
    await this.broadcastJoin(chatMember);
    return chatMember;
  }

  public async remove(req: Request, id: string) {
    const token = cookie.get(req, COOKIE_ENTITY.USER);
    const user = await this.userService.getMe(token);
    if (!user) throw new UnauthorizedException();

    return db.transaction(async (tx) => {
      const member = await this.chatMemberRepository.findById(id, tx);
      if (!member) {
        throw new NotFoundException({ message: "Member Cannot Be Found" });
      }
      const isSelf = member.user_id === user.id;
      if (isSelf) {
        throw new ForbiddenException({ message: "You cannot remove yourself" });
      }
      const chatMember = await this.chatMemberRepository.softDelete(
        member.id,
        tx,
      );
      await this.broadcastRemove(chatMember);
      return chatMember;
    });
  }

  public async leave(req: Request, roomId: string) {
    const token = cookie.get(req, COOKIE_ENTITY.USER);
    const user = await this.userService.getMe(token);
    if (!user) throw new UnauthorizedException();

    return db.transaction(async (tx) => {
      const member = await this.chatMemberRepository.findByUser(
        user.id as string,
        roomId,
        tx,
      );
      if (!member) {
        throw new NotFoundException({ message: "Member Cannot Be Found" });
      }
      if (member.user_id !== user.id) throw new InternalServerException();
      const chatMember = await this.chatMemberRepository.softDelete(
        member.id,
        tx,
      );
      await this.broadcastLeave(chatMember);
      return chatMember;
    });
  }

  private async broadcastJoin(member: ChatMemberWithUser) {
    await this.broadcastMemberEvent(member, ChatMessageTypeEnum.JOIN, "joined");
  }

  private async broadcastLeave(member: ChatMemberWithUser) {
    await this.broadcastMemberEvent(member, ChatMessageTypeEnum.LEAVE, "left");
  }

  private async broadcastRemove(member: ChatMemberWithUser) {
    await this.broadcastMemberEvent(
      member,
      ChatMessageTypeEnum.REMOVE,
      "was removed from",
    );
  }

  private async broadcastInvite(member: ChatMemberWithUser) {
    await this.broadcastMemberEvent(
      member,
      ChatMessageTypeEnum.INVITE,
      "was invited to",
    );
  }

  private async broadcastMemberEvent(
    member: ChatMemberWithUser,
    message_type: ChatMessageTypeEnum,
    action: string,
  ) {
    const username = member.user?.username;
    if (!username) {
      throw new NotFoundException({
        message: "Username not found for the chat member",
      });
    }
    await this.chatMessageService.create({
      chat_member_id: member.id,
      chat_room_id: member.chat_room_id,
      content: `${username} ${action} the chat`,
      message_type,
    });
  }
}
