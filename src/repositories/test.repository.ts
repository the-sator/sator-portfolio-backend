import prisma from "@/loaders/prisma";

export class TestRepository {
  public async getAll() {
    return await prisma.test.findMany();
  }
  public async create(name: string) {
    return await prisma.test.create({
      data: {
        name,
      },
    });
  }
  public async update(id: string, name: string) {
    return await prisma.test.update({
      where: { id },
      data: {
        name,
      },
    });
  }
}
