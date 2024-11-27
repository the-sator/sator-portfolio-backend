import Logger from "@/logger/logger";
import { RoleService } from "@/services/role.service";
import { BaseModelSchema } from "@/types/base.type";
import {
  CheckRoleSchema,
  CreateRoleSchema,
  UpdateRoleSchema,
} from "@/types/role.type";
import type { NextFunction, Response, Request } from "express";

export class RoleController {
  private roleService: RoleService;
  constructor() {
    this.roleService = new RoleService();
  }
  public getRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await this.roleService.findAll();
      res.json({ data: roles });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };

  public getRoleById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = BaseModelSchema.parse({
        id: req.params.id,
      });
      const roles = await this.roleService.findById(validated);
      res.json({ data: roles });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };

  public createRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = CreateRoleSchema.parse(req.body);
      const roles = await this.roleService.create(validated);
      res.json({ data: roles });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };

  public deleteRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = BaseModelSchema.parse({
        id: req.params.id,
      });
      const roles = await this.roleService.delete(validated);
      res.json({ data: roles });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };

  public updateRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = BaseModelSchema.parse({
        id: req.params.id,
      });
      const validatedData = UpdateRoleSchema.parse(req.body);
      const roles = await this.roleService.update(
        Number(validated.id),
        validatedData
      );
      res.json({ data: roles });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };

  public checkRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = CheckRoleSchema.parse(req.body);
      const roles = await this.roleService.check(validated);
      res.json({ data: roles });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };
}
