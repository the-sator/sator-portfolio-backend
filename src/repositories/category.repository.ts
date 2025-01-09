import prisma from "@/loaders/prisma";
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

  public async create(
    auth_id: string,
    isAdmin: boolean,
    payload: CreateCategory
  ) {
    return await prisma.category.create({
      data: {
        name: payload.name,
        color: payload.color,
        admin_id: isAdmin ? auth_id : null,
        site_user_id: !isAdmin ? auth_id : null,
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
