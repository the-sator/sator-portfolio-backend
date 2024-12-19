import type { Request, Response, NextFunction } from "express";
import { ChatRoomService } from "../../services/chat-room.service";
import { CreateChatRoomSchema } from "@/types/chat-room.type";
import { BaseModelSchema } from "@/types/base.type";

export class ChatRoomController {
  private chatRoomService: ChatRoomService;
  constructor() {
    this.chatRoomService = new ChatRoomService();
  }
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chatRooms = await this.chatRoomService.findAll();
      res.json({ data: chatRooms });
    } catch (error) {
      next(error);
    }
  };

  public findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = BaseModelSchema.parse({
        id: req.params.id,
      });
      const chatRoom = await this.chatRoomService.findById(params.id as string);
      res.json({ data: chatRoom });
    } catch (error) {
      next(error);
    }
  };

  public findUserChatRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const chatRooms = await this.chatRoomService.findUserChatRoom(req);
      res.json({ data: chatRooms });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateChatRoomSchema.parse(req.body);
      const chatRooms = await this.chatRoomService.create(validated);
      res.json({ data: chatRooms });
    } catch (error) {
      next(error);
    }
  };
}
