import { cookie, COOKIE_ENTITY } from "@/libs/cookie";
import { UserService } from "@/modules/users/user.service";
import type { Request, Response, NextFunction } from "express";
import { SignUpSchema, SignInSchema } from "../auth/dto";
import { UserFilterSchema, AssignRoleSchema } from "./dto";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getUsers();
      res.success(users);
    } catch (error) {
      next(error);
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
      res.success(users);
    } catch (error) {
      next(error);
    }
  };

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = SignUpSchema.parse(req.body);
      const user = await this.userService.signUp(validated);
      res.success(user);
    } catch (error) {
      next(error);
    }
  };

  public signout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = cookie.get(req, COOKIE_ENTITY.USER);
      await this.userService.signout(token);
      res.simpleSuccess("Successfully Sign Out");
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = cookie.get(req, COOKIE_ENTITY.USER);
      const auth = await this.userService.getMe(token);
      res.success(auth);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = SignInSchema.parse(req.body);
      const user = await this.userService.signin(validated);
      cookie.set(res, COOKIE_ENTITY.USER, user.token);
      res.success(user);
    } catch (error) {
      next(error);
    }
  };

  public assignRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = AssignRoleSchema.parse(req.body);
      const user = await this.userService.assignRole(validated);
      res.success(user);
    } catch (error) {
      next(error);
    }
  };
}
