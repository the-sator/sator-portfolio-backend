import { UserAuth } from "@/authentication/user.auth";
import logger from "@/logger/logger";
import { UserService } from "@/services/user.service";
import { LoginSchema } from "@/types/auth.type";
import { CreateUserSchema, UserFilterSchema } from "@/types/user.type";
import { ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";

export class UserController {
  private userService: UserService;
  private userAuth: UserAuth;

  constructor() {
    this.userService = new UserService();
    this.userAuth = new UserAuth();
  }

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getUsers();
      res.json({ data: users });
    } catch (error) {
      return next(error);
    }
  };

  public paginateUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filter = UserFilterSchema.parse(req.query);
      const users = await this.userService.paginateUsers(filter);
      res.json({ data: users });
    } catch (error) {
      return next(error);
    }
  };

  public addUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateUserSchema.parse(req.body);
      const user = await this.userService.createUser(validated);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  public getUserSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sessionToken = req.cookies["session-user"];
      if (!sessionToken) {
        return ThrowUnauthorized();
      }
      const auth = await this.userAuth.validateSessionToken(sessionToken);
      res.json({ data: auth });
    } catch (error) {
      next(error);
    }
  };

  public userLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = LoginSchema.parse(req.body);
      const user = await this.userService.login(validated);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  };
}
