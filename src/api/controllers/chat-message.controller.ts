import { ChatMessageService } from "@/services/chat-message.service";
import {
  ChatMessageFilterSchema,
  CreateChatMessageSchema,
} from "@/types/chat-message.type";
import { RoomIdSchema } from "@/types/chat-room.type";
import type { Request, Response, NextFunction } from "express";

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
      const { messages, page, page_count, page_size, current_page } =
        await this.chatMessageService.paginateByRoomId(
          req,
          params.roomId as string,
          filter
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
      const messages = await this.chatMessageService.findByRoomId(
        req,
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
