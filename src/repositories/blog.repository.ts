import prisma from "@/loaders/prisma";
import type { CreateBlog } from "@/types/blog.type";
import type { Prisma } from "@prisma/client";

export class BlogRepository {
  public async findAll() {
    return await prisma.blog.findMany();
  }
  public async findBySlug(slug: string) {
    return await prisma.blog.findFirst({
      where: { slug },
      include: {
        CategoryOnBlog: true,
      },
    });
  }
  public async create(payload: CreateBlog, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blog.create({
      data: {
        admin_id: payload.admin_id,
        name: payload.name,
        slug: payload.slug,
        content: payload.content ? JSON.parse(payload.content) : null,
      },
    });
  }
  public async update(
    id: string,
    payload: CreateBlog,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.blog.update({
      where: {
        id,
      },
      data: {
        admin_id: payload.admin_id,
        name: payload.name,
        slug: payload.slug,
        content: payload.content ? JSON.parse(payload.content) : null,
      },
    });
  }
  public async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blog.delete({
      where: {
        id,
      },
    });
  }
  public async publish(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blog.update({
      where: {
        id,
      },
      data: {
        published_at: new Date(),
      },
    });
  }
  public async unpublish(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blog.update({
      where: {
        id,
      },
      data: { published_at: null },
    });
  }
}
