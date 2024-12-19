import prisma from "@/loaders/prisma";
import type { AssignCategoryOnBlog } from "@/types/category.type";
import type { Prisma } from "@prisma/client";

export class CategoryOnBlogRepository {
  public async findAll() {
    return prisma.categoryOnBlog.findMany();
  }
  public async create(
    payload: AssignCategoryOnBlog,
    tx: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return client.categoryOnBlog.create({
      data: {
        blog_id: payload.blog_id,
        assignedBy: payload.assignedBy,
        category_id: payload.category_id,
      },
    });
  }
  public deleteByBlogId(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return client.categoryOnBlog.deleteMany({
      where: { blog_id: id },
    });
  }
}
