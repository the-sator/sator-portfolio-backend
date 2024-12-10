import { FormQuestionService } from "@/services/form-question.service";
import { BaseFilterSchema, BaseModelSchema } from "@/types/base.type";
import { CreateFormQuestionSchema } from "@/types/portfolio-form.type";
import { ThrowInternalServer } from "@/utils/exception";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class FormQuestionController {
  private formQuestionService: FormQuestionService;
  constructor() {
    this.formQuestionService = new FormQuestionService();
  }
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await this.formQuestionService.findAll();
      res.json({ data: question });
    } catch (err) {
      next(err);
    }
  };
  public paginate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = BaseFilterSchema.parse(req.query);
      const { questions, currentPage, page, count } =
        await this.formQuestionService.paginate(validatedQuery);
      res.json({
        data: { data: questions, metadata: { page, count, currentPage } },
      });
    } catch (err) {
      next(err);
    }
  };
  public createQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = CreateFormQuestionSchema.parse(req.body);
      const question = await this.formQuestionService.create(validated);
      res.json({ data: question });
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return ThrowInternalServer("Order must be unique");
      }
      next(err);
    }
  };
  public deleteQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated = BaseModelSchema.parse({
        id: req.params.id,
      });
      const question = await this.formQuestionService.delete(
        validated.id as string
      );
      res.json({ data: question });
    } catch (err) {
      next(err);
    }
  };

  public updateQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse({
        id: req.params.id,
      });
      const validated = CreateFormQuestionSchema.parse(req.body);
      const question = await this.formQuestionService.update(
        params.id as string,
        validated
      );
      res.json({ data: question });
    } catch (err) {
      next(err);
    }
  };
}
