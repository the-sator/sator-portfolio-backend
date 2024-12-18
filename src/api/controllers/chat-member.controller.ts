import { ChatMemberService } from "@/services/chat-member.service";
import { BaseModelSchema } from "@/types/base.type";
import { CreateChatMemberSchema } from "@/types/chat-member.type";
import type { Request, Response, NextFunction } from "express";

export class ChatMemberController {
  private chatMemberService: ChatMemberService;
  constructor() {
    this.chatMemberService = new ChatMemberService();
  }
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chatMembers = await this.chatMemberService.findAll();
      res.json({ data: chatMembers });
    } catch (error) {
      next(error);
    }
  };
  public join = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateChatMemberSchema.parse(req.body);
      const chatMembers = await this.chatMemberService.join(validated);
      res.json({ data: chatMembers });
    } catch (error) {
      next(error);
    }
  };
}
