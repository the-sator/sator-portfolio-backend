import prisma from "@/loaders/prisma";
import { BlogRepository } from "@/repositories/blog.repository";
import { CategoryOnBlogRepository } from "@/repositories/category-on-blog.repository";
import type { CreateBlog } from "@/types/blog.type";

export class BlogService {
  private blogRepository: BlogRepository;
  private categoryOnBlogRepository: CategoryOnBlogRepository;
  constructor() {
    this.blogRepository = new BlogRepository();
    this.categoryOnBlogRepository = new CategoryOnBlogRepository();
  }
  public async findAll() {
    return this.blogRepository.findAll();
  }
  public async findBySlug(slug: string) {
    return this.blogRepository.findBySlug(slug);
  }
  public async create(payload: CreateBlog) {
    if (payload.categories) {
      return await prisma.$transaction(async tx => {
        const blog = await this.blogRepository.create(payload, tx);
        for (const category of payload.categories!) {
          await this.categoryOnBlogRepository.create(
            {
              category_id: category,
              blog_id: blog.id,
              assignedBy: blog.admin_id,
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
    return await prisma.$transaction(async tx => {
      await this.categoryOnBlogRepository.deleteByBlogId(id);
      const blog = await this.blogRepository.update(id, payload, tx);
      if (payload.categories) {
        for (const category of payload.categories) {
          await this.categoryOnBlogRepository.create(
            {
              category_id: category,
              blog_id: blog.id,
              assignedBy: payload.admin_id,
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
}
