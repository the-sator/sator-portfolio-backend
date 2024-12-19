import { ThrowForbidden, ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";
import { AdminAuth } from "./admin.auth";
import type { Admin, Session } from "@prisma/client";
import { RoleRepository } from "@/repositories/role.repository";
import { ResourceRepository } from "@/repositories/resource.repository";
import { UserAuth } from "./user.auth";

type ProtectedRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

function protectedRoute(
  handler: ProtectedRouteHandler,
  options?: {
    resource: string;
    action: "read" | "write" | "delete";
  }
) {
  const adminAuth = new AdminAuth(); // Instantiate AdminAuth
  const userAuth = new UserAuth(); // Instantiate AdminAuth
  const roleRepository = new RoleRepository(); // Instantiate AdminAuth
  const resourceRepository = new ResourceRepository(); // Instantiate AdminAuth

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdminRoute = req.originalUrl.startsWith("/api/admin");
      const sessionToken = isAdminRoute
        ? req.cookies["session-admin"]
        : req.cookies["session-user"];

      if (!sessionToken) {
        return ThrowUnauthorized(); // Handle unauthorized access
      }
      const { session, auth } = isAdminRoute
        ? await adminAuth.validateSessionToken(sessionToken)
        : await userAuth.validateSessionToken(sessionToken);
      if (!session || !auth) {
        return ThrowUnauthorized();
      }

      if (options && isAdminRoute) {
        const role = await roleRepository.findById((auth as Admin).role_id);
        if (!role) {
          return ThrowForbidden();
        }

        const resource = await resourceRepository.findByName(options.resource);

        const permission = role.permissions.find(
          (p) => p.resource_id === resource?.id
        );

        if (!permission) {
          return ThrowForbidden("You have no permission");
        }

        const actionAllowed = permission[options.action];
        if (!actionAllowed) {
          return ThrowForbidden("You have no permission");
        }
      }

      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default protectedRoute;
