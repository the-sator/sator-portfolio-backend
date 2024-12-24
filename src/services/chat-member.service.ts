import { AdminAuth } from "@/authentication/admin.auth";
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
import { ChatMemberRole } from "@prisma/client";
import type { Request } from "express";
export class ChatMemberService {
  private chatMemberRepository: ChatMemberRepository;
  private userRepository: UserRepository;
  private adminRepository: AdminRepository;
  private adminAuth: AdminAuth;
  constructor() {
    this.chatMemberRepository = new ChatMemberRepository();
    this.adminRepository = new AdminRepository();
    this.userRepository = new UserRepository();
    this.adminAuth = new AdminAuth();
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
      return this.chatMemberRepository.create({
        chat_room_id: payload.chat_room_id,
        admin_id: member.type === "ADMIN" ? member.entity.id : undefined,
        user_id: member.type === "USER" ? member.entity.id : undefined,
        role:
          member.type === "USER" ? ChatMemberRole.MEMBER : ChatMemberRole.ADMIN,
      });
    });
    const members = await Promise.all(memberPromises);
    return members;
  }

  public async join(payload: CreateChatMember) {
    const id = payload.admin_id || payload.user_id;
    if (!id) return ThrowInternalServer("Admin ID Or User ID Cannot Be Empty");
    const isMember = await this.chatMemberRepository.isMember(
      id,
      payload.chat_room_id
    );
    if (isMember) return ThrowForbidden("You are already a member");

    const chatMember = await this.chatMemberRepository.create(payload);
    return chatMember;
  }
  public async remove(req: Request, id: string) {
    const { auth } = await this.adminAuth.getAdmin(req);
    if (!auth) return ThrowUnauthorized();

    const member = await this.chatMemberRepository.findById(id);
    if (!member) return ThrowInternalServer("Member Cannot Be Found");
    const isSelf = member.admin_id === auth.id;
    if (!!isSelf) return ThrowInternalServer("You cannot remove yourself");
    return await this.chatMemberRepository.softDelete(id);
  }

  public async leave(req: Request, id: string) {
    const { auth } = await this.adminAuth.getAdmin(req);
    if (!auth) return ThrowUnauthorized();
    const member = await this.chatMemberRepository.findByAdmin(auth.id);
    if (!member) return ThrowInternalServer("Member Cannot Be Found");
    const isNotSelf = member.admin_id !== auth.id;
    if (!!isNotSelf) return ThrowInternalServer("Invalid Auth ID");
    return await this.chatMemberRepository.softDelete(member.id);
  }
}
