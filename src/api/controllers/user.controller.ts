import logger from "@/logger/logger";
import { UserService } from "@/services/user.service";
import { CreateUserSchema } from "@/types/user.type";
import type { Request, Response, NextFunction } from "express";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getUsers();
      res.json({ data: users });
    } catch (error) {
      logger.error("🔥 error: %o", error);
      return next(error);
    }
  }

  public async addUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = CreateUserSchema.parse(req.body);
      const user = await this.userService.createUser(validated);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}
