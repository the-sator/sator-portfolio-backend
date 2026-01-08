import prisma from "@/core/loaders/prisma";
import type { CreateCategory } from "@/types/category.type";

export class CategoryRepository {
  public async findAll() {
    return await prisma.category.findMany();
  }

  public async findBySiteUser(site_user_id: string) {
    return await prisma.category.findMany({
      where: {
        site_user_id,
      },
    });
  }

  public async create(auth_id: string, payload: CreateCategory) {
    return await prisma.category.create({
      data: {
        name: payload.name,
        color: payload.color,
        site_user_id: auth_id
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
