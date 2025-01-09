import { BlogService } from "@/services/blog.service";
import { BaseModelSchema, ValidatedSlugSchema } from "@/types/base.type";
import { BlogFilterSchema, CreateBlogSchema } from "@/types/blog.type";
import type { NextFunction, Request, Response } from "express";

export class BlogController {
  private blogService: BlogService;
  constructor() {
    this.blogService = new BlogService();
  }
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resources = await this.blogService.findAll();
      res.json({ data: resources });
    } catch (error) {
      next(error);
    }
  };

  public findBlogBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedSlug = ValidatedSlugSchema.parse({
        slug: req.params.slug,
      });
      const blog = await this.blogService.findBySlug(validatedSlug.slug);
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };

  public paginateByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filter = BlogFilterSchema.parse(req.query);
      const blogs = await this.blogService.paginateByAdmin(filter);
      res.json({
        data: blogs,
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateBlogSchema.parse(req.body);
      const blog = await this.blogService.create(validated);
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };
  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = BaseModelSchema.parse({ id: req.params.id });
      const validated = CreateBlogSchema.parse(req.body);
      const blog = await this.blogService.update(
        params.id as string,
        validated
      );
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };
  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = BaseModelSchema.parse({ id: req.params.id });
      const blog = await this.blogService.delete(params.id as string);
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };
  public publish = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = BaseModelSchema.parse({ id: req.params.id });
      const blog = await this.blogService.publish(params.id as string);
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };
  public unpublish = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = BaseModelSchema.parse({ id: req.params.id });
      const blog = await this.blogService.unpublish(params.id as string);
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };
}
