import { SiteUserService } from "@/services/site-user.service";
import { LoginSchema, SignUpSchema } from "@/types/auth.type";
import { SiteUserFilterSchema } from "@/types/site-user.type";
import { getSiteUserCookie } from "@/utils/cookie";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import type { NextFunction, Request, Response } from "express";

export class SiteUserController {
  private _siteUserService: SiteUserService;
  constructor() {
    this._siteUserService = new SiteUserService();
  }
  public paginateSiteUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filter = SiteUserFilterSchema.parse(req.query);
      const siteUsers = await this._siteUserService.paginateSiteUsers(filter);
      res.json({ data: siteUsers });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = getSiteUserCookie(req);
      if (!sessionToken) {
        return ThrowUnauthorized();
      }
      const auth = await this._siteUserService.getMe(sessionToken);
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
      const validated = SignUpSchema.parse(req.body);
      const siteUser = await this._siteUserService.create(validated);
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
      const siteUser = await this._siteUserService.siteUserlogin(valdiated);
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
      const token = getSiteUserCookie(req);
      const result = await this._siteUserService.signout(token);
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
