import prisma from "@/loaders/prisma";
import { CreateUserSchema, type CreateUser } from "@/types/user.type";

export class UserRepository {
  public async findAll() {
    return prisma.user.findMany();
  }

  public async addUser(payload: CreateUser) {
    return prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
      },
    });
  }
}
