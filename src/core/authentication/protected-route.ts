import type { Request, Response, NextFunction } from "express";
import { RoleRepository } from "@/modules/role/role.repository";
import { ResourceRepository } from "@/repositories/resource.repository";
import { UserService } from "@/modules/users/user.service";
import { env } from "@/libs";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../response/error/exception";
import { cookie, COOKIE_ENTITY } from "@/libs/cookie";

type ProtectedRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

function protectedRoute(
  handler: ProtectedRouteHandler,
  options?: {
    resource: string;
    action: "read" | "write" | "delete";
  },
) {
  const userService = new UserService(); // Instantiate AdminAuth
  const roleRepository = new RoleRepository(); // Instantiate AdminAuth
  const resourceRepository = new ResourceRepository(); // Instantiate AdminAuth

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const isUserRoute = req.originalUrl.startsWith(`${env.API_PREFIX}/users`);
      const sessionToken = isUserRoute
        ? cookie.get(req, COOKIE_ENTITY.USER)
        : cookie.get(req, COOKIE_ENTITY.SITE_USER);

      if (!sessionToken) {
        throw new UnauthorizedException(); // Handle unauthorized access
      }
      const user = await userService.getMe(sessionToken);
      if (!user) {
        throw new UnauthorizedException(); // Handle unauthorized access
      }

      if (options && isUserRoute) {
        const role = await roleRepository.findById(user.role_id);

        if (!role) {
          throw new ForbiddenException(); // Handle unauthorized access
        }

        const resource = await resourceRepository.findByName(options.resource);

        const permission = role.permission_flags.find(
          (p) => p.resource_id === resource?.id,
        );

        if (!permission) {
          throw new ForbiddenException({ message: "You have no permission" });
        }

        const actionAllowed = permission[options.action];
        if (!actionAllowed) {
          throw new ForbiddenException({ message: "You have no permission" });
        }
      }

      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default protectedRoute;
