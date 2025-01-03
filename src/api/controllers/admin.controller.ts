import { AdminAuth } from "@/authentication/admin.auth";
import logger from "@/logger/logger";
import { AdminService } from "@/services/admin.service";
import {
  AssignAdminRoleSchema,
  CreateAdminSchema,
  UpdateAdminTotpSchema,
} from "@/types/admin.type";
import { LoginSchema } from "@/types/auth.type";
import { BaseModelSchema, ValidateSessionTokenSchema } from "@/types/base.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";

export class AdminController {
  private adminService: AdminService;
  private adminAuth: AdminAuth;

  constructor() {
    this.adminService = new AdminService();
    this.adminAuth = new AdminAuth();
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
      const validated = LoginSchema.parse(req.body);
      const admin = await this.adminService.login(validated);
      res.json({ data: admin });
    } catch (error) {
      next(error);
    }
  };

  public signout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = BaseModelSchema.parse(req.body);
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

  public getAdminSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sessionToken = req.cookies["session-admin"];
      if (!sessionToken) {
        return ThrowUnauthorized();
      }
      const auth = await this.adminAuth.validateSessionToken(sessionToken);
      res.json({ data: auth });
    } catch (error) {
      next(error);
    }
  };

  public updateAdminTotp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // const validated = UpdateAdminTotpSchema.parse(req.body);
      const admin = await this.adminService.updateAdminTotp(req.body);
      res.json({ data: admin });
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
      const validated = AssignAdminRoleSchema.parse(req.body);
      const admin = await this.adminService.assignRole(validated);
      res.json({ data: admin });
    } catch (error) {
      next(error);
    }
  };
}
