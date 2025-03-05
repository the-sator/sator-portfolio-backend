import prisma from "@/loaders/prisma";
import { BlogMetricRepository } from "@/repositories/blog-metric.repository";
import { BlogRepository } from "@/repositories/blog.repository";
import { CategoryOnBlogRepository } from "@/repositories/category-on-blog.repository";
import { SiteUserRepository } from "@/repositories/site-user.repository";
import type { Identity } from "@/types/base.type";
import type { BlogFilter, CreateBlog } from "@/types/blog.type";
import {
  ThrowForbidden,
  ThrowNotFound,
  ThrowUnauthorized,
} from "@/utils/exception";
import { getPaginationMetadata } from "@/utils/pagination";

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
  public async findAll() {
    return this.blogRepository.findAll();
  }
  public async findBySlug(slug: string) {
    return this.blogRepository.findBySlug(slug);
  }

  public async paginateByAdmin(filter: BlogFilter) {
    const count = await this.blogRepository.count(filter);
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const blogs = await this.blogRepository.paginateAdmin(filter);
    return {
      data: blogs,
      metadata: { page, page_count, page_size, current_page },
    };
  }
  public async paginateBySiteUser(site_user_id: string, filter: BlogFilter) {
    const count = await this.blogRepository.count(filter, {
      site_user_id,
    });
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const blogs = await this.blogRepository.paginateBySiteUserId(
      site_user_id,
      filter
    );
    return {
      data: blogs,
      metadata: { page, page_count, page_size, current_page },
    };
  }

  public async paginateBySiteUserApiKey(key: string, filter: BlogFilter) {
    const siteUser = await this.siteUserRepository.findByApiKey(key);
    if (!siteUser) return ThrowUnauthorized();
    const count = await this.blogRepository.count(filter, {
      site_user_id: siteUser.id,
    });
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const publishedFilter = {
      ...filter,
      published: true as const, // Force TypeScript to recognize this as true
    };
    const blogs = await this.blogRepository.paginateBySiteUserId(
      siteUser.id,
      publishedFilter
    );
    return {
      data: blogs,
      metadata: { page, page_count, page_size, current_page },
    };
  }

  public async create(identity: Identity, payload: CreateBlog) {
    if (payload.categories) {
      return await prisma.$transaction(async (tx) => {
        const blog = await this.blogRepository.create(payload, identity, tx);
        for (const category of payload.categories!) {
          await this.categoryOnBlogRepository.create(
            {
              category_id: category,
              blog_id: blog.id,
              assignedBy: identity.id,
            },
            tx
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
    if (!blog) return ThrowNotFound();
    const owner_id = blog.admin_id || blog.site_user_id;
    if (identity.id !== owner_id) return ThrowUnauthorized();
    return await prisma.$transaction(async (tx) => {
      await this.categoryOnBlogRepository.deleteByBlogId(id);
      const blog = await this.blogRepository.update(id, payload, tx);
      if (payload.categories) {
        for (const category of payload.categories) {
          await this.categoryOnBlogRepository.create(
            {
              category_id: category,
              blog_id: blog.id,
              assignedBy: identity.id,
            },
            tx
          );
        }
      }
      return blog;
    });
  }

  public async increaseView(key: string, slug: string) {
    const siteUser = await this.siteUserRepository.findByApiKey(key);
    if (!siteUser) return ThrowUnauthorized();
    const blog = await this.blogRepository.findBySlug(slug);
    if (!blog) return ThrowForbidden("No Record Found");
    return await prisma.$transaction(async (tx) => {
      const metric = await this.blogMetricRepository.findByBlogToday(
        blog.id,
        tx
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
