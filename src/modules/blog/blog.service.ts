import { ContentStatus } from "@/enum/content.enum";
import { db } from "@/db";
import { BlogMetricRepository } from "@/repositories/blog-metric.repository";
import { BlogRepository } from "@/repositories/blog.repository";
import { CategoryOnBlogRepository } from "@/repositories/category-on-blog.repository";
import { SiteUserRepository } from "@/modules/site-user/site-user.repository";
import type { Identity } from "@/core/types/base.type";
import type { BlogFilter, CreateBlog } from "@/types/blog.type";
import { getPaginationMeta } from "@/utils/pagination";
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@/core/response/error/exception";

export class BlogService {
  private blogRepository: BlogRepository;
  private categoryOnBlogRepository: CategoryOnBlogRepository;
  private blogMetricRepository: BlogMetricRepository;
  private siteUserRepository: SiteUserRepository;
  constructor() {
    this.blogRepository = new BlogRepository();
    this.categoryOnBlogRepository = new CategoryOnBlogRepository();
    this.blogMetricRepository = new BlogMetricRepository();
    this.siteUserRepository = new SiteUserRepository();
  }
  public async getAll() {
    return this.blogRepository.findAll();
  }

  public async getAllSlugBySiteUser(key: string) {
    const siteUser = await this.siteUserRepository.findByApiKey(key);
    if (!siteUser) throw new UnauthorizedException();
    const slugs = await this.blogRepository.findAllSlug(siteUser.id);
    return slugs.map((slug) => {
      return slug.slug;
    });
  }

  public async getBySlug(slug: string) {
    return this.blogRepository.findBySlug(slug);
  }

  public async getPublishedBlogBySlug(slug: string) {
    return this.blogRepository.findBySlug(slug, ContentStatus.PUBLISHED);
  }

  public async paginateByAdmin(filter: BlogFilter) {
    const count = await this.blogRepository.count(filter);
    const meta = getPaginationMeta(filter, count);
    const blogs = await this.blogRepository.paginateAdmin(filter);
    return {
      data: blogs,
      meta,
    };
  }
  public async paginateBySiteUser(site_user_id: string, filter: BlogFilter) {
    const count = await this.blogRepository.count(filter, {
      site_user_id,
    });
    const meta = getPaginationMeta(filter, count);
    const blogs = await this.blogRepository.paginateBySiteUserId(
      site_user_id,
      filter,
    );
    return {
      data: blogs,
      meta,
    };
  }

  public async paginateBySiteUserApiKey(key: string, filter: BlogFilter) {
    const siteUser = await this.siteUserRepository.findByApiKey(key);
    if (!siteUser) throw new UnauthorizedException();
    const count = await this.blogRepository.count(filter, {
      site_user_id: siteUser.id,
    });
    const meta = getPaginationMeta(filter, count);
    const publishedFilter = {
      ...filter,
      published_at: {
        not: null,
      },
    };
    const blogs = await this.blogRepository.paginateBySiteUserId(
      siteUser.id,
      publishedFilter,
      ContentStatus.PUBLISHED,
    );
    return {
      data: blogs,
      meta,
    };
  }

  public async create(identity: Identity, payload: CreateBlog) {
    if (payload.categories) {
      return await db.transaction(async (tx) => {
        const blog = await this.blogRepository.create(payload, identity, tx);
        for (const category of payload.categories!) {
          await this.categoryOnBlogRepository.create(
            {
              category_id: category,
              blog_id: blog.id,
              assignedBy: identity.id,
            },
            tx,
          );
        }
        return blog;
      });
    }
    const blog = await this.blogRepository.create(payload, identity);
    return blog;
  }

  public async update(id: string, identity: Identity, payload: CreateBlog) {
    const blog = await this.blogRepository.findById(id);
    if (!blog) throw new NotFoundException();
    const owner_id = blog.site_user_id;
    if (identity.id !== owner_id) throw new ForbiddenException();
    return await db.transaction(async (tx) => {
      await this.categoryOnBlogRepository.deleteByBlogId(id, tx);
      const blog = await this.blogRepository.update(id, payload, tx);
      if (payload.categories) {
        for (const category of payload.categories) {
          await this.categoryOnBlogRepository.create(
            {
              category_id: category,
              blog_id: blog.id,
              assignedBy: identity.id,
            },
            tx,
          );
        }
      }
      return blog;
    });
  }

  public async increaseView(key: string, slug: string) {
    const siteUser = await this.siteUserRepository.findByApiKey(key);
    if (!siteUser) throw new UnauthorizedException();
    const blog = await this.blogRepository.findBySlug(slug);
    if (!blog) throw new NotFoundException();
    return await db.transaction(async (tx) => {
      const metric = await this.blogMetricRepository.findByBlogToday(
        blog.id,
        tx,
      );
      //If not found, then create new note metric
      if (!metric) {
        await this.blogMetricRepository.createBlogMetric(blog.id, tx);
        return blog;
      }
      await this.blogMetricRepository.increaseView(metric.id, tx);
      return blog;
    });
  }

  public async publish(id: string) {
    return this.blogRepository.publish(id);
  }
  public async unpublish(id: string) {
    return this.blogRepository.unpublish(id);
  }

  public async delete(id: string) {
    return this.blogRepository.delete(id);
  }
}
