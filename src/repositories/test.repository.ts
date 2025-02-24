import prisma from "@/loaders/prisma";

export class TestRepository {
  public async create(name: string) {
    return await prisma.test.create({
      data: {
        name,
      },
    });
  }
  public async getAll() {
    return await prisma.test.findMany();
  }
}
