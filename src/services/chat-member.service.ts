import { AdminAuth } from "@/authentication/admin.auth";
import { io } from "@/loaders/socket";
import { AdminRepository } from "@/repositories/admin.repository";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { UserRepository } from "@/repositories/user.repository";
import type {
  CreateChatMember,
  InviteChatMember,
} from "@/types/chat-member.type";
import {
  ThrowForbidden,
  ThrowInternalServer,
  ThrowUnauthorized,
} from "@/utils/exception";
import {
  ChatMemberRole,
  ChatMessageType,
  Prisma,
  type ChatMember,
} from "@prisma/client";
import type { Request } from "express";
import { ChatMessageService } from "./chat-message.service";
import prisma from "@/loaders/prisma";
import { UnreadMessageService } from "./unread-message.service";

type ChatMemberWithAdminUser = Prisma.ChatMemberGetPayload<{
  include: { admin: true; user: true };
}>;
export class ChatMemberService {
  private chatMemberRepository: ChatMemberRepository;
  private userRepository: UserRepository;
  private adminRepository: AdminRepository;
  private adminAuth: AdminAuth;
  private chatMessageService: ChatMessageService;
  private unreadMessageService: UnreadMessageService;

  constructor() {
    this.chatMemberRepository = new ChatMemberRepository();
    this.adminRepository = new AdminRepository();
    this.userRepository = new UserRepository();
    this.adminAuth = new AdminAuth();
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
    const admin = await this.adminRepository.findById(id);
    if (admin) {
      return { type: "ADMIN", entity: admin };
    }
    return ThrowInternalServer("Record cannot be found");
  }

  public async findAllInvitableMember(id?: string) {
    if (id) {
      const [users, admins, members] = await Promise.all([
        this.userRepository.findAll(),
        this.adminRepository.findAll(),
        this.chatMemberRepository.findByRoomId(id),
      ]);
      const adminMemberIds = new Set(members.map((member) => member.admin_id));
      const usermemberIds = new Set(members.map((member) => member.user_id));

      const sanitizedUsers = users.filter(
        (user) => !usermemberIds.has(user.id)
      );
      const sanitizedAdmins = admins.filter(
        (admin) => !adminMemberIds.has(admin.id)
      );
      return { users: sanitizedUsers, admins: sanitizedAdmins };
    }
    const [users, admins] = await Promise.all([
      this.userRepository.findAll(),
      this.adminRepository.findAll(),
    ]);
    return { users, admins };
  }

  public async invite(payload: InviteChatMember) {
    const memberPromises = payload.chat_members!.map(async (memberId) => {
      const member = await this.findMember(memberId);
      const chatMember = await this.chatMemberRepository.create({
        chat_room_id: payload.chat_room_id,
        admin_id: member.type === "ADMIN" ? member.entity.id : undefined,
        user_id: member.type === "USER" ? member.entity.id : undefined,
        role:
          member.type === "USER" ? ChatMemberRole.MEMBER : ChatMemberRole.ADMIN,
      });
      await this.unreadMessageService.create({
        chat_member_id: chatMember.id,
        chat_room_id: payload.chat_room_id,
        total_count: 0,
      });
      await this.broadcastInvite(chatMember);
      return chatMember;
    });
    const members = await Promise.all(memberPromises);
    return members;
  }

  public async join(payload: CreateChatMember) {
    const id = payload.admin_id || payload.user_id;
    if (!id) return ThrowInternalServer("Admin ID Or User ID Cannot Be Empty");
    const chatMember = await prisma.$transaction(async (tx) => {
      const member = await this.chatMemberRepository.isMember(
        id,
        payload.chat_room_id,
        tx
      );
      // If member is found and left, restore the member
      if (member && member.left_at) {
        const chatMember = await this.chatMemberRepository.restore(
          member.id,
          tx
        );
        return chatMember;
      }

      const chatMember = await this.chatMemberRepository.create(payload, tx);
      return chatMember;
    });
    await this.broadcastJoin(chatMember);
    return chatMember;
  }

  public async remove(req: Request, id: string) {
    const { auth } = await this.adminAuth.getAdmin(req);
    if (!auth) return ThrowUnauthorized();
    return await prisma.$transaction(async (tx) => {
      const member = await this.chatMemberRepository.findById(id, tx);
      if (!member) return ThrowInternalServer("Member Cannot Be Found");
      const isSelf = member.admin_id === auth.id;
      if (!!isSelf) return ThrowInternalServer("You cannot remove yourself");
      const chatMember = await this.chatMemberRepository.softDelete(
        member.id,
        tx
      );
      await this.broadcastRemove(chatMember);
      return chatMember;
    });
  }

  public async leave(req: Request, roomId: string) {
    const { auth } = await this.adminAuth.getAdmin(req);
    if (!auth) return ThrowUnauthorized();
    return await prisma.$transaction(async (tx) => {
      const member = await this.chatMemberRepository.findByAdmin(
        auth.id,
        roomId,
        tx
      );
      if (!member) return ThrowInternalServer("Member Cannot Be Found");
      const isNotSelf = member.admin_id !== auth.id;
      if (!!isNotSelf) return ThrowInternalServer("Invalid Auth ID");
      const chatMember = await this.chatMemberRepository.softDelete(
        member.id,
        tx
      );
      await this.broadcastLeave(chatMember);
      return chatMember;
    });
  }

  /** BROADCAST EVENT */

  // Broadcast that the member has joined the chat
  private async broadcastJoin(member: ChatMemberWithAdminUser) {
    const username = member.admin?.username || member.user?.username;
    if (!username) {
      return ThrowInternalServer("Username not found for the chat member");
    }

    await this.chatMessageService.create({
      chat_member_id: member.id,
      chat_room_id: member.chat_room_id,
      content: `${username} has joined the chat`,
      message_type: ChatMessageType.JOIN,
    });
  }

  private async broadcastLeave(member: ChatMemberWithAdminUser) {
    const username = member.admin?.username || member.user?.username;
    if (!username) {
      return ThrowInternalServer("Username not found for the chat member");
    }

    await this.chatMessageService.create({
      chat_member_id: member.id,
      chat_room_id: member.chat_room_id,
      content: `${username} has left the chat`,
      message_type: ChatMessageType.LEAVE,
    });
  }

  private async broadcastRemove(member: ChatMemberWithAdminUser) {
    const username = member.admin?.username || member.user?.username;
    if (!username) {
      return ThrowInternalServer("Username not found for the chat member");
    }

    await this.chatMessageService.create({
      chat_member_id: member.id,
      chat_room_id: member.chat_room_id,
      content: `${username} was removed from the chat`,
      message_type: ChatMessageType.REMOVE,
    });
  }

  private async broadcastInvite(member: ChatMemberWithAdminUser) {
    const username = member.admin?.username || member.user?.username;
    if (!username) {
      return ThrowInternalServer("Username not found for the chat member");
    }

    await this.chatMessageService.create({
      chat_member_id: member.id,
      chat_room_id: member.chat_room_id,
      content: `${username} was invited to the chat`,
      message_type: ChatMessageType.INVITE,
    });
  }
}
