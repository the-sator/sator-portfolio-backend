import { ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";
import { AdminAuth } from "./admin.auth";
import type { Admin, Session } from "@prisma/client";

type ProtectedRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

function protectedRoute(handler: ProtectedRouteHandler) {
  const adminAuth = new AdminAuth(); // Instantiate AdminAuth

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const sessionToken = req.cookies["session"]; // Retrieve the session token

      if (!sessionToken) {
        return ThrowUnauthorized(); // Handle unauthorized access
      }

      // Validate the session token
      const { session, admin } = await adminAuth.validateSessionToken(
        sessionToken
      );

      if (!session || !admin) {
        return ThrowUnauthorized();
      }

      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default protectedRoute;
