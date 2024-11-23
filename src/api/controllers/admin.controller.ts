import logger from "@/logger/logger";
import { AdminService } from "@/services/admin.service";
import { CreateAdminSchema } from "@/types/admin.type";
import { ValidateSessionTokenSchema } from "@/types/base.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  public getAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const admins = await this.adminService.getAdmins();
      res.json({ data: admins });
    } catch (error) {
      logger.error("🔥 error: %o", error);
      return next(error);
    }
  };

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateAdminSchema.parse(req.body);
      const admin = await this.adminService.signUp(validated);
      res.json({ data: admin });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateAdminSchema.parse(req.body);
      const admin = await this.adminService.login(validated);
      res.json({ data: admin });
    } catch (error) {
      next(error);
    }
  };

  public signout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = req.cookies["session"];
      if (!sessionToken) {
        return ThrowUnauthorized();
      }
      const validated = ValidateSessionTokenSchema.parse({
        token: sessionToken,
      });
      const result = await this.adminService.signout(validated);
      if (!result) {
        return ThrowInternalServer();
      }
      res.json({
        data: "Successfully Sign Out",
      });
    } catch (error) {
      next(error);
    }
  };

  public getSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sessionToken = req.cookies["session"];
      if (!sessionToken) {
        return ThrowUnauthorized();
      }
      const validated = ValidateSessionTokenSchema.parse({
        token: sessionToken,
      });
      const admin = await this.adminService.getSession(validated);
      res.json({ data: admin });
    } catch (error) {
      next(error);
    }
  };
}
