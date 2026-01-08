import { SiteUserService } from "@/modules/site-user/site-user.service";
import { cookie, COOKIE_ENTITY } from "@/libs/cookie";
import type { NextFunction, Request, Response } from "express";
import { SiteUserFilterSchema } from "./dto/site-user-filter.dto";
import { CreateSiteUserSchema } from "./dto/create-site-user.dto";
import { BaseModelSchema } from "@/core/types/base.type";
import { SiteUserSigninSchema } from "./dto/site-user-signin.dto";
import {
  ForbiddenException,
  UnauthorizedException,
} from "@/core/response/error/exception";
import { OnboardingSchema } from "./dto/onboarding.dto";
import { UpdateTotpSchema } from "../auth/dto/update-totp.dto";

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
      res.success(siteUsers);
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = cookie.get(req, COOKIE_ENTITY.SITE_USER);
      const auth = await this._siteUserService.getMe(sessionToken);
      res.success(auth);
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
      res.success(siteUser);
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
      const validated = SiteUserSigninSchema.parse(req.body);
      const siteUser = await this._siteUserService.signin(
        params.id as string,
        validated
      );
      cookie.set(res, COOKIE_ENTITY.SITE_USER, siteUser.token);
      res.success(siteUser);
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
      const token = cookie.get(req, COOKIE_ENTITY.SITE_USER);
      await this._siteUserService.signout(token);
      cookie.delete(res, COOKIE_ENTITY.SITE_USER);
      res.simpleSuccess();
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
        throw new ForbiddenException({ message: "User is already registered" });
      }
      res.simpleSuccess();
    } catch (error) {
      next(error);
    }
  };

  // public firstLogin = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const params = BaseModelSchema.parse(req.params);
  //     const payload = OnboardingSchema.parse(req.body);
  //     const siteUser = await this._siteUserService.firstLogin(
  //       params.id as string,
  //       payload
  //     );
  //     setCookie(res, COOKIE.SITE_USER, siteUser.token);
  //     res.json({
  //       data: siteUser,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public updateAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse(req.params);
      const payload = OnboardingSchema.parse(req.body);
      const token = cookie.get(req, COOKIE_ENTITY.SITE_USER);
      const siteUser = await this._siteUserService.updateAuth(
        params.id as string,
        token,
        payload
      );
      res.success(siteUser);
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
      if (!key) throw new UnauthorizedException({ message: "No Token Found" });
      await this._siteUserService.increaseView(key);
      res.simpleSuccess();
    } catch (error) {
      next(error);
    }
  };

  public updateTotp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = UpdateTotpSchema.parse(req.body);
      const token = cookie.get(req, COOKIE_ENTITY.SITE_USER);
      if (!token)
        throw new UnauthorizedException({ message: "No Token Found" });
      const admin = await this._siteUserService.updateSiteUserTotp(
        token,
        validated
      );
      res.success(admin);
    } catch (error) {
      next(error);
    }
  };
}
