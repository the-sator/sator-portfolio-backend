import { config } from "@/config";
import { SimpleSuccess } from "@/response/response";
import { PortfolioService } from "@/services/portfolio.service";
import {
  BaseModelSchema,
  IdentityRole,
  ValidatedSlugSchema,
} from "@/types/base.type";
import {
  CreatePortfolioSchema,
  PortfolioFilterSchema,
} from "@/types/portfolio.type";
import { getAdminCookie, getSiteUserCookie } from "@/utils/cookie";
import { ThrowUnauthorized } from "@/utils/exception";
import type { NextFunction, Response, Request } from "express";

export class PortfolioController {
  private portfolioService: PortfolioService;
  constructor() {
    this.portfolioService = new PortfolioService();
  }
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resources = await this.portfolioService.findAll();
      res.json({ data: resources });
    } catch (error) {
      next(error);
    }
  };

  public findPortfolioBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedSlug = ValidatedSlugSchema.parse({
        slug: req.params.slug,
      });
      const portfolio = await this.portfolioService.findBySlug(
        validatedSlug.slug
      );
      res.json({ data: portfolio });
    } catch (error) {
      next(error);
    }
  };

  public paginateByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filter = PortfolioFilterSchema.parse(req.query);
      const portfolios = await this.portfolioService.paginateByAdmin(filter);
      res.json({
        data: portfolios,
      });
    } catch (error) {
      next(error);
    }
  };

  public paginateBySiteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filter = PortfolioFilterSchema.parse(req.query);
      const portfolios = await this.portfolioService.paginateBySiteUser(
        req,
        filter
      );
      res.json({
        data: portfolios,
      });
    } catch (error) {
      next(error);
    }
  };

  public paginateBySiteUserApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const key = req.headers.authorization?.split(" ")[1];
      if (!key) return ThrowUnauthorized("No Token Found");
      const filter = PortfolioFilterSchema.parse(req.query);
      const portfolios = await this.portfolioService.paginateBySiteUserApiKey(
        key,
        filter
      );
      res.json({
        data: portfolios,
      });
    } catch (error) {
      next(error);
    }
  };

  public createPortfolio = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = CreatePortfolioSchema.parse(req.body);
      const role = req.originalUrl.startsWith(`${config.api.prefix}/admin`)
        ? IdentityRole.ADMIN
        : IdentityRole.SITE_USER;
      const token =
        role === IdentityRole.ADMIN
          ? getAdminCookie(req)
          : getSiteUserCookie(req);
      const portfolio = await this.portfolioService.create(
        token,
        validated,
        role
      );
      res.json({ data: portfolio });
    } catch (error) {
      next(error);
    }
  };

  public updatePortfolio = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse({
        id: req.params.id,
      });
      const validated = CreatePortfolioSchema.parse(req.body);
      const role = req.originalUrl.startsWith(`${config.api.prefix}/admin`)
        ? IdentityRole.ADMIN
        : IdentityRole.SITE_USER;
      const token =
        role === IdentityRole.ADMIN
          ? getAdminCookie(req)
          : getSiteUserCookie(req);
      const portfolio = await this.portfolioService.update(
        token,
        params.id as string,
        validated,
        role
      );
      res.json({ data: portfolio });
    } catch (error) {
      next(error);
    }
  };
  public deletePortfolio = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse({
        id: req.params.id,
      });
      const portfolio = await this.portfolioService.delete(params.id as string);
      res.json({ data: portfolio });
    } catch (error) {
      next(error);
    }
  };

  public publishPortfolio = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse({
        id: req.params.id,
      });
      const portfolio = await this.portfolioService.publish(
        params.id as string
      );
      res.json({ data: portfolio });
    } catch (error) {
      next(error);
    }
  };
  public unpublishPortfolio = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse({
        id: req.params.id,
      });
      const portfolio = await this.portfolioService.unpublish(
        params.id as string
      );
      res.json({ data: portfolio });
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
      const params = ValidatedSlugSchema.parse({
        slug: req.params.slug,
      });
      await this.portfolioService.increaseView(key, params.slug);
      SimpleSuccess(res);
    } catch (error) {
      next(error);
    }
  };
}
