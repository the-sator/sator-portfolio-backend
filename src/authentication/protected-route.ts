import { ThrowForbidden, ThrowUnauthorized } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";
import { AdminAuth } from "./admin.auth";
import type { Admin, Session } from "@prisma/client";
import { RoleRepository } from "@/repositories/role.repository";
import { ResourceRepository } from "@/repositories/resource.repository";

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
  const roleRepository = new RoleRepository(); // Instantiate AdminAuth
  const resourceRepository = new ResourceRepository(); // Instantiate AdminAuth

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

      if (options) {
        const role = await roleRepository.findById(admin.role_id!);
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
