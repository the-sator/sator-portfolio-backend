import { FormAttemptRepository } from "@/repositories/form-attempt.repository";
import { FormResponseRepository } from "@/repositories/form-response.repository";
import type {
  CreateFormAttempt,
  FormAttemptFilter,
} from "@/types/portfolio-form.type";
import prisma from "@/loaders/prisma";
import { UserService } from "./user.service";
import {
  ThrowForbidden,
  ThrowInternalServer,
  ThrowNotFound,
  ThrowUnauthorized,
} from "@/utils/exception";
import { sumArray } from "@/utils/string";
import { getPaginationMetadata } from "@/utils/pagination";
import { AdminService } from "./admin.service";
import { ChatRoomService } from "./chat-room.service";
import { ChatMessageService } from "./chat-message.service";
import { UserRepository } from "@/repositories/user.repository";
import { ChatMemberRepository } from "@/repositories/chat-member.repository";

export class FormAttemptService {
  private formAttemptRepository: FormAttemptRepository;
  private formResponseRepository: FormResponseRepository;
  private userRepository: UserRepository;
  private chatMemberRepository: ChatMemberRepository;
  private userService: UserService;
  private adminService: AdminService;
  private chatRoomService: ChatRoomService;
  private chatMessageService: ChatMessageService;

  constructor() {
    this.formAttemptRepository = new FormAttemptRepository();
    this.formResponseRepository = new FormResponseRepository();
    this.chatMemberRepository = new ChatMemberRepository();
    this.userService = new UserService();
    this.adminService = new AdminService();
    this.chatRoomService = new ChatRoomService();
    this.chatMessageService = new ChatMessageService();
    this.userRepository = new UserRepository();
  }
  public async findByUser(token: string) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    return await this.formAttemptRepository.findByUser(user.id);
  }

  public async paginateByUser(token: string, filter: FormAttemptFilter) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    const countAsync = this.formAttemptRepository.count(filter);
    const attemptsAsync = this.formAttemptRepository.paginateByUser(
      user.id,
      filter
    );
    const [count, attempts] = await Promise.all([countAsync, attemptsAsync]);
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    return {
      data: attempts,
      metadata: { page, page_count, page_size, current_page },
    };
  }

  public async getAttemptById(token: string, attempt_id: string) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    const attemptAsync = this.formAttemptRepository.findById(attempt_id);
    const attempt = await attemptAsync;
    if (!attempt) return ThrowNotFound();
    if (attempt.user_id !== user.id) return ThrowForbidden();
    return attempt;
  }
  //TODO: Do anonymous account later
  public async create(token: string, payload: CreateFormAttempt) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    return prisma.$transaction(async (tx) => {
      const attempt = await this.formAttemptRepository.create(user.id, tx);
      const responses = await Promise.all(
        payload.responses.map((res) =>
          this.formResponseRepository.create(res, attempt.id, tx)
        )
      );
      const price = responses.reduce(
        (prev, curr) => {
          return sumArray(prev, curr.form_option.price);
        },
        [0, 0]
      );
      const updatedPriceAttempt = await this.formAttemptRepository.updatePrice(
        attempt.id,
        price,
        tx
      );
      return updatedPriceAttempt;
    });
  }
  public async bringItToLife(token: string, attempt_id: string) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    const attempt = await this.formAttemptRepository.findById(attempt_id);
    if (!attempt) return ThrowNotFound();
    //If no default room, meaning this is a new customer, create new room for them
    if (!user.default_chat_room_id) {
      const ids = new Set<string>();
      const admins = await this.adminService.getAllAdminIds();
      admins.map((admin) => ids.add(admin.id));
      ids.add(user.id);

      const room = await this.chatRoomService.create({
        name: `Support Team - ${user.username}`,
        chat_members: Array.from(ids),
      });
      const userMember = room.chat_members.find(
        (member) => member.user_id === user.id
      );
      if (!userMember) return ThrowInternalServer("User Member Not Found");

      await this.chatMessageService.create(
        {
          chat_room_id: room.id,
          chat_member_id: userMember.id,
          content: `I want to bring this portfolio website to life\nHere is the ID: ${attempt_id}`,
          message_type: "FORM_ATTEMPT",
        },
        { id: attempt_id }
      );

      await this.userRepository.updateDefaultChatRoom(user.id, room.id);
      return {
        ...attempt,
        chat_room_id: room.id,
      };
    }
    const userMember = await this.chatMemberRepository.findByUser(
      user.id,
      user.default_chat_room_id
    );
    if (!userMember) return ThrowInternalServer();
    await this.chatMessageService.create(
      {
        chat_room_id: user.default_chat_room_id,
        chat_member_id: userMember.id,
        content: `I want to bring this portfolio website to life.`,
        message_type: "FORM_ATTEMPT",
      },
      { id: attempt_id }
    );
    return {
      ...attempt,
      chat_room_id: user.default_chat_room_id,
    };
  }
}
