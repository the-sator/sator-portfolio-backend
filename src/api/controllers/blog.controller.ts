import { BlogService } from "@/services/blog.service";
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
}
