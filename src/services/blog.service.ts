import prisma from "@/loaders/prisma";
import { BlogMetricRepository } from "@/repositories/blog-metric.repository";
import { BlogRepository } from "@/repositories/blog.repository";
import { CategoryOnBlogRepository } from "@/repositories/category-on-blog.repository";
import type { BlogFilter, CreateBlog } from "@/types/blog.type";
import { ThrowForbidden } from "@/utils/exception";
import { getPaginationMetadata } from "@/utils/pagination";

export class BlogService {
  private blogRepository: BlogRepository;
  private categoryOnBlogRepository: CategoryOnBlogRepository;
  private blogMetricRepository: BlogMetricRepository;
  constructor() {
    this.blogRepository = new BlogRepository();
    this.categoryOnBlogRepository = new CategoryOnBlogRepository();
    this.blogMetricRepository = new BlogMetricRepository();
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

  public async create(payload: CreateBlog) {
    if (payload.categories) {
      return await prisma.$transaction(async (tx) => {
        const blog = await this.blogRepository.create(payload, tx);
        for (const category of payload.categories!) {
          await this.categoryOnBlogRepository.create(
            {
              category_id: category,
              blog_id: blog.id,
              assignedBy: blog.admin_id || blog.site_user_id || "",
            },
            tx
          );
        }
        return blog;
      });
    }
    const blog = await this.blogRepository.create(payload);
    return blog;
  }
  public async update(id: string, payload: CreateBlog) {
    return await prisma.$transaction(async (tx) => {
      await this.categoryOnBlogRepository.deleteByBlogId(id);
      const blog = await this.blogRepository.update(id, payload, tx);
      if (payload.categories) {
        for (const category of payload.categories) {
          await this.categoryOnBlogRepository.create(
            {
              category_id: category,
              blog_id: blog.id,
              assignedBy: blog.admin_id || blog.site_user_id || "",
            },
            tx
          );
        }
      }
      return blog;
    });
  }
  public async delete(id: string) {
    return this.blogRepository.delete(id);
  }
  public async publish(id: string) {
    return this.blogRepository.publish(id);
  }
  public async unpublish(id: string) {
    return this.blogRepository.unpublish(id);
  }

  public async increaseView(slug: string) {
    const blog = await this.blogRepository.findBySlug(slug);
    if (!blog) return ThrowForbidden("No Record Found");
    return await prisma.$transaction(async (tx) => {
      const noteMetric = await this.blogMetricRepository.findByBlog(
        blog.id,
        tx
      );
      //If not found, then create new note metric
      if (!noteMetric) {
        await this.blogMetricRepository.createNoteMetric(
          {
            blog_id: blog.id,
            view: 1,
          },
          tx
        );
        return blog;
      }
      await this.blogMetricRepository.increaseView(
        noteMetric.id,
        Number(noteMetric.view),
        tx
      );
      return blog;
    });
  }
}
