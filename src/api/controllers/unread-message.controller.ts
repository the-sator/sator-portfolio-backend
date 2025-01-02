import { UnreadMessageService } from "@/services/unread-message.service";
import { BaseModelSchema } from "@/types/base.type";
import type { NextFunction, Response, Request } from "express";
export class UnreadMessageController {
  private unreadMessageService: UnreadMessageService;
  constructor() {
    this.unreadMessageService = new UnreadMessageService();
  }

  public getByAuthId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const unreadMessages = await this.unreadMessageService.findByAuth(req);
      res.json({ data: unreadMessages });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse(req.params);

      const read = await this.unreadMessageService.updateUnread(
        params.id as string,
        0
      );
      res.json({ data: read });
    } catch (error) {
      next(error);
    }
  };
}
