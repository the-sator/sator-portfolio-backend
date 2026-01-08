import { BlogService } from "@/services/blog.service";
import { SiteUserService } from "@/modules/site-user/site-user.service";
import {
  BaseModelSchema,
  IdentityRole,
  ValidatedSlugSchema,
  type Identity,
} from "@/core/types/base.type";
import { BlogFilterSchema, CreateBlogSchema } from "@/types/blog.type";
import { cookie, COOKIE_ENTITY } from "@/libs/cookie";
import type { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "@/core/response/error/exception";

export class BlogController {
  private blogService: BlogService;
  private siteUserService: SiteUserService;
  constructor() {
    this.blogService = new BlogService();
    this.siteUserService = new SiteUserService();
  }
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resources = await this.blogService.getAll();
      res.json({ data: resources });
    } catch (error) {
      next(error);
    }
  };

  public getAllPublishedSlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const key = req.headers.authorization?.split(" ")[1];
      if (!key) throw new UnauthorizedException({ message: "No Token Found" });
      const resources = await this.blogService.getAllSlugBySiteUser(key);
      res.json({ data: resources });
    } catch (error) {
      next(error);
    }
  };

  public getBlogBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedSlug = ValidatedSlugSchema.parse({
        slug: req.params.slug,
      });
      const blog = await this.blogService.getBySlug(validatedSlug.slug);
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };

  public getPublishedBlogBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedSlug = ValidatedSlugSchema.parse({
        slug: req.params.slug,
      });
      const blog = await this.blogService.getPublishedBlogBySlug(
        validatedSlug.slug
      );
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };

  public paginateBySiteUserApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const key = req.headers.authorization?.split(" ")[1];
      if (!key) throw new UnauthorizedException({ message: "No Token Found" });
      const filter = BlogFilterSchema.parse(req.query);
      const portfolios = await this.blogService.paginateBySiteUserApiKey(
        key,
        filter
      );
      res.json({
        data: portfolios,
      });
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

  public paginateBySiteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sessionToken = cookie.get(req, COOKIE_ENTITY.SITE_USER);
      if (!sessionToken) throw new UnauthorizedException();
      const siteUser = await this.siteUserService.getMe(sessionToken);
      if (!siteUser) throw new UnauthorizedException();
      const filter = BlogFilterSchema.parse(req.query);
      const blogs = await this.blogService.paginateBySiteUser(
        siteUser.id as string,
        filter
      );
      res.json({
        data: blogs,
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = cookie.get(req, COOKIE_ENTITY.SITE_USER);
      const siteUser = await this.siteUserService.getMe(token);

      const identity: Identity = {
        id: siteUser.id as string,
        role: IdentityRole.SITE_USER,
      };

      const validated = CreateBlogSchema.parse(req.body);
      const blog = await this.blogService.create(identity, validated);
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };
  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = cookie.get(req, COOKIE_ENTITY.SITE_USER);
      const siteUser = await this.siteUserService.getMe(token);
      const identity: Identity = {
        id: siteUser.id as string,
        role: IdentityRole.SITE_USER,
      };
      const params = BaseModelSchema.parse({ id: req.params.id });
      const validated = CreateBlogSchema.parse(req.body);
      const blog = await this.blogService.update(
        params.id as string,
        identity,
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

  public increaseView = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const key = req.headers.authorization?.split(" ")[1];
      if (!key) throw new UnauthorizedException();
      const validatedSlug = ValidatedSlugSchema.parse({
        slug: req.params.slug,
      });
      await this.blogService.increaseView(key, validatedSlug.slug);
      res.simpleSuccess();
    } catch (error) {
      next(error);
    }
  };
}
