import { SiteUserService } from "@/services/site-user.service";
import { StatisticService } from "@/services/statistic.service";
import { getSiteUserCookie } from "@/utils/cookie";
import { ThrowUnauthorized } from "@/utils/exception";
import type { NextFunction, Response, Request } from "express";

export class StatisticController {
  private statisticService: StatisticService;
  private siteUserService: SiteUserService;
  constructor() {
    this.statisticService = new StatisticService();
    this.siteUserService = new SiteUserService();
  }
  public getTotalPortfolioMetric = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sessionToken = getSiteUserCookie(req);
      const siteUser = await this.siteUserService.getMe(sessionToken);
      if (!siteUser) return ThrowUnauthorized();
      const metric = await this.statisticService.getSiteUserTotalMetric(
        siteUser.id
      );
      res.json({
        data: metric,
      });
    } catch (error) {
      next(error);
    }
  };
  public getDailyPortfolioMetric = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sessionToken = getSiteUserCookie(req);
      const siteUser = await this.siteUserService.getMe(sessionToken);
      if (!siteUser) return ThrowUnauthorized();
      const metric = await this.statisticService.getSiteUserDailyMetric(
        siteUser.id
      );
      res.json({
        data: metric,
      });
    } catch (error) {
      next(error);
    }
  };
}
