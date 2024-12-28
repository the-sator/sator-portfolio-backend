import { ChatMemberService } from "@/services/chat-member.service";
import { BaseModelSchema } from "@/types/base.type";
import {
  CreateChatMemberSchema,
  InviteChatMemberSchema,
} from "@/types/chat-member.type";
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
  public findAllInvitableMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const chatMembers = await this.chatMemberService.findAllInvitableMember(
        req.params.id
      );
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
  public invite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = InviteChatMemberSchema.parse(req.body);
      const chatMembers = await this.chatMemberService.invite(validated);
      res.json({ data: chatMembers });
    } catch (error) {
      next(error);
    }
  };
  public remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = BaseModelSchema.parse(req.params);
      const chatMember = await this.chatMemberService.remove(
        req,
        params.id as string
      );
      res.json({ data: chatMember });
    } catch (error) {
      next(error);
    }
  };
  public leave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = BaseModelSchema.parse(req.params);
      const chatMember = await this.chatMemberService.leave(
        req,
        params.id as string
      );
      res.json({ data: chatMember });
    } catch (error) {
      next(error);
    }
  };
}
