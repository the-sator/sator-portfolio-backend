import prisma from "@/loaders/prisma";
import type { CreateCategory } from "@/types/category.type";

export class CategoryRepository {
  public async findAll() {
    return await prisma.category.findMany();
  }

  public async create(payload: CreateCategory) {
    return await prisma.category.create({
      data: {
        name: payload.name,
        color: payload.color,
      },
    });
  }

  public async update(id: string, payload: CreateCategory) {
    return await prisma.category.update({
      where: { id },
      data: {
        name: payload.name,
        color: payload.color,
      },
    });
  }
  public async delete(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  }
}
