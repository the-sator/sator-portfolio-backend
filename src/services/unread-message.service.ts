import { UnreadMessageRepository } from "@/repositories/unread-message.repository";
import type { CreateUnreadMessage } from "@/types/unread-message.type";
import { ThrowInternalServer } from "@/utils/exception";
import type { Prisma } from "@prisma/client";

export class UnreadMessageService {
  private unreadMessageRepository: UnreadMessageRepository;
  constructor() {
    this.unreadMessageRepository = new UnreadMessageRepository();
  }
  public async findAll() {
    return this.unreadMessageRepository.findAll();
  }

  public async findByMember(chat_room_id: string, auth_id: string) {
    return this.unreadMessageRepository.findByMember(chat_room_id, auth_id);
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
