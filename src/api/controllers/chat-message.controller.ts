import { io } from "@/loaders/socket";
import { ChatMessageService } from "@/services/chat-message.service";
import { CreateChatMessageSchema } from "@/types/chat-message.type";
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
      const messages = await this.chatMessageService.create(validated);
      io.emit(`chat-room:${messages.chat_room_id}`, validated);
      res.json({ data: messages });
    } catch (error) {
      next(error);
    }
  };
}
