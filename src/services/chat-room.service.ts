import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import { ChatRoomRepository } from "@/repositories/chat-room.repository";
import type { CreateChatRoom } from "@/types/chat-room.type";

export class ChatRoomService {
  private chatRoomRepository: ChatRoomRepository;
  private chatMemberRepository: ChatMemberRepository;
  constructor() {
    this.chatRoomRepository = new ChatRoomRepository();
    this.chatMemberRepository = new ChatMemberRepository();
  }
  public async findAll() {
    return this.chatRoomRepository.findAll();
  }

  public async findById(id: string) {
    return this.chatRoomRepository.findById(id);
  }

  public async create(payload: CreateChatRoom) {
    return this.chatRoomRepository.create(payload);
  }
}
