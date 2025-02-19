import prisma from "@/loaders/prisma";
import type { CreateBlogMetric } from "@/types/blog-metric.type";
import type { Prisma } from "@prisma/client";

export class BlogMetricRepository {
  public async findAll() {
    return await prisma.blogMetric.findMany();
  }
  public async findByBlog(blog_id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blogMetric.findFirst({
      where: {
        blog_id,
      },
    });
  }
  public async findByBlogToday(blog_id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return await client.blogMetric.findFirst({
      where: {
        blog_id,
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }
  public async createNoteMetric(
    payload: CreateBlogMetric,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.blogMetric.create({
      data: {
        like: payload.like || 0,
        view: payload.view || 0,
        blog_id: payload.blog_id,
      },
    });
  }
  public async increaseView(
    id: string,
    view: number,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.blogMetric.update({
      where: {
        id,
      },
      data: {
        view: (view += 1),
      },
    });
  }
}
