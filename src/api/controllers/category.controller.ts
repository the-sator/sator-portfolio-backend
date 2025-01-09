import Logger from "@/logger/logger";
import { CategoryService } from "@/services/category.service";
import { BaseModelSchema } from "@/types/base.type";
import { CreateCategorySchema } from "@/types/category.type";
import type { NextFunction, Response, Request } from "express";
export class CategoryController {
  private categoryService: CategoryService;
  constructor() {
    this.categoryService = new CategoryService();
  }
  public getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categories = await this.categoryService.findAll();
      res.json({ data: categories });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };

  public findCategoriesBySiteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categories = await this.categoryService.findBySiteUser(req);
      res.json({ data: categories });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };

  public createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("req.body:", req.body);
      const validated = CreateCategorySchema.parse(req.body);
      const categories = await this.categoryService.create(req, validated);
      res.json({ data: categories });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };

  public updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse({
        id: req.params.id,
      });
      const validated = CreateCategorySchema.parse(req.body);
      const categories = await this.categoryService.update(
        params.id as string,
        validated
      );
      res.json({ data: categories });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };
  public deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse({
        id: req.params.id,
      });
      const categories = await this.categoryService.delete(params.id as string);
      res.json({ data: categories });
    } catch (error) {
      Logger.error(error);
      next(error);
    }
  };
}
