import { ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";
import { getSiteUserCookie } from "@/utils/cookie";
import { SiteUserService } from "@/services/site-user.service";

type ProtectedRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

function protectedSiteUserRoute(handler: ProtectedRouteHandler) {
  const siteUserService = new SiteUserService();

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const sessionToken = getSiteUserCookie(req);
      if (!sessionToken) {
        return ThrowUnauthorized(); // Handle unauthorized access
      }
      const siteUser = await siteUserService.getMe(sessionToken);
      if (!siteUser) {
        return ThrowUnauthorized();
      }
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default protectedSiteUserRoute;
