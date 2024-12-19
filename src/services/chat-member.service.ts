import { ChatMemberRepository } from "@/repositories/chat-member.repository";
import type { CreateChatMember } from "@/types/chat-member.type";
import { ThrowForbidden, ThrowInternalServer } from "@/utils/exception";

export class ChatMemberService {
  private chatMemberRepository: ChatMemberRepository;
  constructor() {
    this.chatMemberRepository = new ChatMemberRepository();
  }

  public async findAll() {
    return this.chatMemberRepository.findAll();
  }

  public async findByRoomId(id: string) {
    return this.chatMemberRepository.findByRoomId(id);
  }

  public async join(payload: CreateChatMember) {
    const id = payload.admin_id || payload.user_id;
    if (!id) {
      return ThrowInternalServer("Admin ID Or User ID Cannot Be Empty");
    }
    const isMember = await this.chatMemberRepository.isMember(
      id,
      payload.chat_room_id
    );
    if (isMember) {
      return ThrowForbidden("You are already a member");
    }
    const chatMember = await this.chatMemberRepository.create(payload);
    return chatMember;
  }
}
