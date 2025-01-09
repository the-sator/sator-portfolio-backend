import { SiteUserAuth } from "@/authentication/site-user.auth";
import { SiteUserService } from "@/services/site-user.service";
import { LoginSchema } from "@/types/auth.type";
import { BaseModelSchema } from "@/types/base.type";
import {
  CreateSiteUserSchema,
  SiteUserFilterSchema,
} from "@/types/site-user.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import type { NextFunction, Request, Response } from "express";

export class SiteUserController {
  private siteUserService: SiteUserService;
  private siteUserAuth: SiteUserAuth;
  constructor() {
    this.siteUserService = new SiteUserService();
    this.siteUserAuth = new SiteUserAuth();
  }
  public paginateSiteUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filter = SiteUserFilterSchema.parse(req.query);
      const siteUsers = await this.siteUserService.paginateSiteUsers(filter);
      res.json({ data: siteUsers });
    } catch (error) {
      next(error);
    }
  };

  public getSiteUserSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sessionToken = req.cookies["session-site-user"];
      if (!sessionToken) {
        return ThrowUnauthorized();
      }
      const auth = await this.siteUserAuth.validateSessionToken(sessionToken);
      res.json({ data: auth });
    } catch (error) {
      next(error);
    }
  };

  public createSiteUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = CreateSiteUserSchema.parse(req.body);
      const siteUser = await this.siteUserService.create(validated);
      res.json({ data: siteUser });
    } catch (error) {
      next(error);
    }
  };

  public siteUserLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const valdiated = LoginSchema.parse(req.body);
      const siteUser = await this.siteUserService.siteUserlogin(valdiated);
      res.json({ data: siteUser });
    } catch (error) {
      next(error);
    }
  };

  public siteUserSignout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.siteUserService.siteUserSignout(req);
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
}
