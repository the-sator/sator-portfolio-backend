import prisma from "@/loaders/prisma";
import type { CreateAdmin } from "@/types/admin.type";
import { exclude } from "@/utils/fetch";

export class AdminRepository {
  public async findAll() {
    return await prisma.admin.findMany({
      omit: {
        password: true,
      },
    });
  }
  public async findByEmail(email: string) {
    return prisma.admin.findUnique({
      where: { email },
    });
  }
  public async checkEmailAndUsername(email: string, username: string) {
    return prisma.admin.findUnique({
      where: { email, username },
    });
  }
  public async createAdmin(payload: CreateAdmin) {
    return prisma.admin.create({
      data: {
        email: payload.email,
        password: payload.password,
        username: payload.username,
      },
    });
  }
}
