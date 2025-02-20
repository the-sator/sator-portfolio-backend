import { ThrowForbidden, ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";
import type { Admin } from "@prisma/client";
import { RoleRepository } from "@/repositories/role.repository";
import { ResourceRepository } from "@/repositories/resource.repository";
import { getAdminCookie, getUserCookie } from "@/utils/cookie";
import { AdminService } from "@/services/admin.service";
import { UserService } from "@/services/user.service";
import config from "@/config/environment";

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
  const userService = new UserService(); // Instantiate AdminAuth
  const adminService = new AdminService(); // Instantiate AdminAuth
  const roleRepository = new RoleRepository(); // Instantiate AdminAuth
  const resourceRepository = new ResourceRepository(); // Instantiate AdminAuth

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdminRoute = req.originalUrl.startsWith(
        `${config.api.prefix}/admin`
      );
      const sessionToken = isAdminRoute
        ? getAdminCookie(req)
        : getUserCookie(req);

      console.log("sessionToken:", sessionToken);
      if (!sessionToken) {
        return ThrowUnauthorized(); // Handle unauthorized access
      }
      const auth = isAdminRoute
        ? await adminService.getMe(sessionToken)
        : await userService.getMe(sessionToken);
      if (!auth) {
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
