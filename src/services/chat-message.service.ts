// import prisma from "@/core/loaders/prisma";
// import { ChatMemberRepository } from "@/repositories/chat-member.repository";
// import { ChatMessageRepository } from "@/repositories/chat-message.repository";
// import { ChatRoomRepository } from "@/repositories/chat-room.repository";
// import type {
//   ChatMessageFilter,
//   CreateChatMessage,
// } from "@/types/chat-message.type";
// import { getPaginationMetadata } from "@/utils/pagination";
// import { WSEventType, WSReceiver } from "@/enum/ws-event.enum";
// import { WSService } from "./ws.service";
// import { UnreadMessageService } from "./unread-message.service";
// import { UserService } from "../modules/users/user.service";
// import { AdminService } from "../modules/admin/admin.service";
// import { ChatRoomService } from "./chat-room.service";
// import type { Prisma } from "@prisma/client";
// import {
//   ForbiddenException,
//   InternalServerException,
//   UnauthorizedException,
// } from "@/core/response/error/exception";

export class ChatMessageService {
  //   private chatMessageRepository: ChatMessageRepository;
  //   private chatMemberRepository: ChatMemberRepository;
  //   private chatRoomRepository: ChatRoomRepository;
  //   private adminService: AdminService;
  //   private userService: UserService;
  //   private unreadMessageService: UnreadMessageService;
  //   private chatRoomService: ChatRoomService;
  //   private wsService: WSService;
  //   constructor() {
  //     this.chatMessageRepository = new ChatMessageRepository();
  //     this.chatMemberRepository = new ChatMemberRepository();
  //     this.chatRoomRepository = new ChatRoomRepository();
  //     this.adminService = new AdminService();
  //     this.userService = new UserService();
  //     this.unreadMessageService = new UnreadMessageService();
  //     this.chatRoomService = new ChatRoomService();
  //     this.wsService = new WSService();
  //   }
  //   public async findAll() {
  //     return this.chatMessageRepository.findAll();
  //   }
  //   public async findByRoomId(token: string, id: string) {
  //     const admin = await this.adminService.getMe(token);
  //     if (!admin) {
  //       throw new UnauthorizedException();
  //     }
  //     const member = await this.chatMemberRepository.isMemberActive(
  //       admin.id as string,
  //       id
  //     );
  //     if (!member) {
  //       throw new ForbiddenException({
  //         message: "You are not a member of the chat room",
  //       });
  //     }
  //     const messages = this.chatMessageRepository.findByRoomId(id);
  //     return messages;
  //   }
  //   public async paginateByRoomId(
  //     token: string,
  //     id: string,
  //     filter: ChatMessageFilter,
  //     isAdmin: boolean
  //   ) {
  //     const auth = isAdmin
  //       ? await this.adminService.getMe(token)
  //       : await this.userService.getMe(token);
  //     if (!auth) {
  //       throw new UnauthorizedException();
  //     }
  //     const member = await this.chatMemberRepository.isMemberActive(
  //       auth.id as string,
  //       id
  //     );
  //     if (!member) {
  //       throw new ForbiddenException({
  //         message: "You are not a member of the chat room",
  //       });
  //     }
  //     const count = await this.chatMessageRepository.count(id);
  //     const meta = getPaginationMetadata(filter, count);
  //     const messages = await this.chatMessageRepository.paginateByRoomId(
  //       id,
  //       filter
  //     );
  //     return { data: messages, meta };
  //   }
  //   public async create(
  //     payload: CreateChatMessage,
  //     metadata?:
  //       | Prisma.NullableJsonNullValueInput
  //       | Prisma.InputJsonValue
  //       | undefined
  //   ) {
  //     return prisma.$transaction(async (tx) => {
  //       const members = await this.chatMemberRepository.findByRoomId(
  //         payload.chat_room_id
  //       );
  //       const message = await this.chatMessageRepository.create(
  //         payload,
  //         metadata,
  //         tx
  //       );
  //       // Remove the sender id
  //       const authIds = members.map(
  //         (member) => member.user_id || member.admin_id || ""
  //       );
  //       const authIdsExcludeSender = members
  //         .filter((member) => member.id !== payload.chat_member_id)
  //         .map((member) => member.user_id || member.admin_id || "");
  //       for (const id of authIdsExcludeSender) {
  //         const unread = await this.unreadMessageService.findByMember(
  //           payload.chat_room_id,
  //           id
  //         );
  //         if (!unread) throw new InternalServerException();
  //         await this.unreadMessageService.updateUnread(
  //           unread.id,
  //           (unread.total_count += 1)
  //         );
  //       }
  //       const updatedRoom = await this.chatRoomRepository.bumpToLatest(
  //         payload.chat_room_id,
  //         message.id,
  //         tx
  //       );
  //       await this.wsService.broadcastToMany(
  //         authIds,
  //         WSReceiver.MEMBER,
  //         WSEventType.NEW_MESSAGE,
  //         message
  //       );
  //       this.wsService.broadcastToMany(
  //         authIds,
  //         WSReceiver.MEMBER,
  //         WSEventType.UPDATE_ROOM,
  //         updatedRoom
  //       );
  //       return message;
  //     });
  //   }
}
