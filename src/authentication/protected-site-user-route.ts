import { ThrowForbidden, ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";
import { AdminAuth } from "./admin.auth";
import type { Admin, Session } from "@prisma/client";
import { RoleRepository } from "@/repositories/role.repository";
import { ResourceRepository } from "@/repositories/resource.repository";
import { UserAuth } from "./user.auth";
import { SiteUserAuth } from "./site-user.auth";

type ProtectedRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

function protectedSiteUserRoute(handler: ProtectedRouteHandler) {
  const siteUserAuth = new SiteUserAuth(); // Instantiate AdminAuth

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const sessionToken = req.cookies["session-site-user"];
      if (!sessionToken) {
        return ThrowUnauthorized(); // Handle unauthorized access
      }
      const { session, user } = await siteUserAuth.validateSessionToken(
        sessionToken
      );
      if (!session || !user) {
        return ThrowUnauthorized();
      }
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default protectedSiteUserRoute;
