import { BlogService } from "@/services/blog.service";
import { SiteUserService } from "@/services/site-user.service";
import {
  BaseModelSchema,
  IdentityRole,
  ValidatedSlugSchema,
  type Identity,
} from "@/types/base.type";
import { BlogFilterSchema, CreateBlogSchema } from "@/types/blog.type";
import { getAdminCookie, getSiteUserCookie } from "@/utils/cookie";
import { ThrowForbidden, ThrowUnauthorized } from "@/utils/exception";
import type { NextFunction, Request, Response } from "express";
import config from "@/config/environment";
import { AdminService } from "@/services/admin.service";
import { SimpleSuccess } from "@/response/response";

export class BlogController {
  private blogService: BlogService;
  private siteUserService: SiteUserService;
  private adminService: AdminService;
  constructor() {
    this.blogService = new BlogService();
    this.siteUserService = new SiteUserService();
    this.adminService = new AdminService();
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

  public paginateBySiteUserApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const key = req.headers.authorization?.split(" ")[1];
      if (!key) return ThrowUnauthorized("No Token Found");
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
      const sessionToken = getSiteUserCookie(req);
      if (!sessionToken) return ThrowForbidden("No Token");
      const siteUser = await this.siteUserService.getMe(sessionToken);
      if (!siteUser) return ThrowUnauthorized();
      const filter = BlogFilterSchema.parse(req.query);
      const blogs = await this.blogService.paginateBySiteUser(
        siteUser.id,
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
      const isAdmin = req.originalUrl.startsWith(`${config.api.prefix}/admin`);
      let identity: Identity;
      if (isAdmin) {
        const token = getAdminCookie(req);
        const admin = await this.adminService.getMe(token);
        identity = {
          id: admin.id,
          role: IdentityRole.ADMIN,
        };
      } else {
        const token = getSiteUserCookie(req);
        const siteUser = await this.siteUserService.getMe(token);
        identity = {
          id: siteUser.id,
          role: IdentityRole.SITE_USER,
        };
      }
      const validated = CreateBlogSchema.parse(req.body);
      const blog = await this.blogService.create(identity, validated);
      res.json({ data: blog });
    } catch (error) {
      next(error);
    }
  };
  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isAdmin = req.originalUrl.startsWith(`${config.api.prefix}/admin`);
      let identity: Identity;
      if (isAdmin) {
        const token = getAdminCookie(req);
        const admin = await this.adminService.getMe(token);
        identity = {
          id: admin.id,
          role: IdentityRole.ADMIN,
        };
      } else {
        const token = getSiteUserCookie(req);
        const siteUser = await this.siteUserService.getMe(token);
        identity = {
          id: siteUser.id,
          role: IdentityRole.SITE_USER,
        };
      }
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
      if (!key) return ThrowUnauthorized("No Token Found");
      const validatedSlug = ValidatedSlugSchema.parse({
        slug: req.params.slug,
      });
      await this.blogService.increaseView(validatedSlug.slug);
      SimpleSuccess(res);
    } catch (error) {
      next(error);
    }
  };
}
