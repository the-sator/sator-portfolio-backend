import { ChatMessageService } from "@/services/chat-message.service";
import {
  ChatMessageFilterSchema,
  CreateChatMessageSchema,
} from "@/types/chat-message.type";
import { RoomIdSchema } from "@/types/chat-room.type";
import type { Request, Response, NextFunction } from "express";
import { env } from "@/libs";
import { cookie, COOKIE_ENTITY } from "@/libs/cookie";

export class ChatMessageController {
  private chatMessageService: ChatMessageService;
  constructor() {
    this.chatMessageService = new ChatMessageService();
  }

  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await this.chatMessageService.findAll();
      res.json({ data: messages });
    } catch (error) {
      next(error);
    }
  };

  public paginateByRoomId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = RoomIdSchema.parse(req.params);
      const filter = ChatMessageFilterSchema.parse(req.query);
      const isAdminRoute = req.originalUrl.startsWith(
        `${env.API_PREFIX}/admin`
      );
      const token = isAdminRoute
        ? cookie.get(req, COOKIE_ENTITY.ADMIN)
        : cookie.get(req, COOKIE_ENTITY.USER);
      const data = await this.chatMessageService.paginateByRoomId(
        token,
        params.roomId as string,
        filter,
        isAdminRoute
      );
      res.json({ data });
    } catch (error) {
      next(error);
    }
  };
  public findByRoomId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = RoomIdSchema.parse(req.params);
      const token = cookie.get(req, COOKIE_ENTITY.USER);
      const messages = await this.chatMessageService.findByRoomId(
        token,
        params.roomId as string
      );
      res.json({ data: messages });
    } catch (error) {
      next(error);
    }
  };
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateChatMessageSchema.parse(req.body);
      const message = await this.chatMessageService.create(validated);
      res.json({ data: message });
    } catch (error) {
      next(error);
    }
  };
}
