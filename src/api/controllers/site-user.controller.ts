import { SimpleSuccess } from "@/response/response";
import { SiteUserService } from "@/services/site-user.service";
import { BaseModelSchema, COOKIE } from "@/types/base.type";
import {
  CreateSiteUserSchema,
  OnboardingSchema,
  SiteUserAuthSchema,
  SiteUserFilterSchema,
} from "@/types/site-user.type";
import { deleteCookie, getSiteUserCookie, setCookie } from "@/utils/cookie";
import {
  ThrowForbidden,
  ThrowInternalServer,
  ThrowUnauthorized,
} from "@/utils/exception";
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
      const validated = CreateSiteUserSchema.parse(req.body);
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
      const params = BaseModelSchema.parse(req.params);
      const validated = SiteUserAuthSchema.parse(req.body);
      const siteUser = await this._siteUserService.siteUserlogin(
        params.id as string,
        validated
      );
      setCookie(res, COOKIE.SITE_USER, siteUser.token);
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
      deleteCookie(res, COOKIE.SITE_USER);

      res.json({
        data: "Successfully Sign Out",
      });
    } catch (error) {
      next(error);
    }
  };

  public checkIsRegistered = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse(req.params);
      const isRegistered = await this._siteUserService.checkIsRegistered(
        params.id as string
      );
      if (isRegistered) {
        return ThrowForbidden("User is already registered");
      }
      SimpleSuccess(res);
    } catch (error) {
      next(error);
    }
  };

  public firstLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse(req.params);
      const payload = OnboardingSchema.parse(req.body);
      const siteUser = await this._siteUserService.firstLogin(
        params.id as string,
        payload
      );
      setCookie(res, COOKIE.SITE_USER, siteUser.token);
      res.json({
        data: siteUser,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse(req.params);
      const payload = OnboardingSchema.parse(req.body);
      const token = getSiteUserCookie(req);
      const siteUser = await this._siteUserService.updateAuth(
        params.id as string,
        token,
        payload
      );
      res.json({
        data: siteUser,
      });
    } catch (error) {
      next(error);
    }
  };

  public increaseView = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const key = req.headers.authorization?.split(" ")[1];
      if (!key) return ThrowUnauthorized("No Token Found");
      await this._siteUserService.increaseView(key);
      SimpleSuccess(res);
    } catch (error) {
      next(error);
    }
  };
}
