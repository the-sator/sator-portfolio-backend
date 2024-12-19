import { UserAuth } from "@/authentication/user.auth";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import type { CreateChatRoom } from "@/types/chat-room.type";
import { ThrowUnauthorized } from "@/utils/exception";
import type { Request } from "express";

export class ChatRoomService {
  private chatRoomRepository: ChatRoomRepository;
  private chatMemberRepository: ChatMemberRepository;
  private userAuth: UserAuth;
  constructor() {
    this.chatRoomRepository = new ChatRoomRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.userAuth = new UserAuth();
  }
  public async findAll() {
    return this.chatRoomRepository.findAll();
  }

  public async findById(id: string) {
    return this.chatRoomRepository.findById(id);
  }

  public async findUserChatRoom(req: Request) {
    const { auth } = await this.userAuth.getUser(req);
    if (!auth) {
      return ThrowUnauthorized();
    }
    return this.chatRoomRepository.findUserChatRoom(auth.id!);
  }

  public async create(payload: CreateChatRoom) {
    return this.chatRoomRepository.create(payload);
  }
}
