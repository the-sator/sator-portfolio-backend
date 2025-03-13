import { FormAttemptService } from "@/services/form-attempt.service";
import { BaseModelSchema } from "@/types/base.type";
import {
  CreateFormAttemptSchema,
  FormAttemptFilterSchema,
} from "@/types/portfolio-form.type";
import { getUserCookie } from "@/utils/cookie";
import { ThrowForbidden } from "@/utils/exception";
import type { Request, Response, NextFunction } from "express";

export class FormAttemptController {
  private formAttemptService: FormAttemptService;
  constructor() {
    this.formAttemptService = new FormAttemptService();
  }

  public findByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = getUserCookie(req);
      if (!token) return ThrowForbidden();
      const data = await this.formAttemptService.findByUser(token);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  };
  public paginateByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = getUserCookie(req);
      if (!token) return ThrowForbidden();
      const filter = FormAttemptFilterSchema.parse(req.query);
      const data = await this.formAttemptService.paginateByUser(token, filter);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  };
  public getAttemptById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = BaseModelSchema.parse(req.params);
      const token = getUserCookie(req);
      if (!token) return ThrowForbidden();
      const data = await this.formAttemptService.getAttemptById(
        token,
        validated.id as string
      );
      res.json({ data });
    } catch (error) {
      next(error);
    }
  };
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateFormAttemptSchema.parse(req.body);
      const token = getUserCookie(req);
      if (!token) return ThrowForbidden();
      const data = await this.formAttemptService.create(token, validated);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  };
}
