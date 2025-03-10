import { ChatMessageService } from "@/services/chat-message.service";
import {
  ChatMessageFilterSchema,
  CreateChatMessageSchema,
} from "@/types/chat-message.type";
import { RoomIdSchema } from "@/types/chat-room.type";
import { getAdminCookie, getUserCookie } from "@/utils/cookie";
import type { Request, Response, NextFunction } from "express";
import config from "@/config/environment";

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
        `${config.api.prefix}/admin`
      );
      const token = isAdminRoute ? getAdminCookie(req) : getUserCookie(req);
      const { messages, page, page_count, page_size, current_page } =
        await this.chatMessageService.paginateByRoomId(
          token,
          params.roomId as string,
          filter,
          isAdminRoute
        );
      res.json({
        data: {
          data: messages,
          metadata: { page, page_size, page_count, current_page },
        },
      });
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
      const token = getAdminCookie(req);
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
