import { UserService } from "@/services/user.service";
import { LoginSchema, SignUpSchema } from "@/types/auth.type";
import { UserFilterSchema } from "@/types/user.type";
import { getUserCookie } from "@/utils/cookie";
import { ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = SignUpSchema.parse(req.body);
      const user = await this.userService.signup(validated);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = getUserCookie(req);
      if (!sessionToken) {
        return ThrowUnauthorized();
      }
      const auth = await this.userService.getMe(sessionToken);
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
