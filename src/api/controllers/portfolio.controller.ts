import { PortfolioService } from "@/services/portfolio.service";
import { BaseModelSchema, ValidatedSlugSchema } from "@/types/base.type";
import { CreatePortfolioSchema } from "@/types/portfolio.type";
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
      const resources = await this.portfolioService.findBySlug(
        validatedSlug.slug
      );
      res.json({ data: resources });
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
      const portfolio = await this.portfolioService.create(validated);
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
      const portfolio = await this.portfolioService.update(
        params.id as string,
        validated
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
}
