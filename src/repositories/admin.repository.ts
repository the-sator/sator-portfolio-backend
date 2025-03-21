import prisma from "@/loaders/prisma";
import type { AssignAdminRole, CreateAdmin } from "@/types/admin.type";
import type { UpdateTotp } from "@/types/auth.type";

export interface EncryptedUpdateTotp extends Omit<UpdateTotp, "key"> {
  key: Uint8Array;
}

export class AdminRepository {
  public async findAll() {
    return await prisma.admin.findMany({
      include: {
        role: true,
      },
    });
  }
  public async findAllIds() {
    return await prisma.admin.findMany({
      select: {
        id: true,
      },
    });
  }
  public async findById(id: string) {
    return prisma.admin.findUnique({
      where: { id },
    });
  }
  public async createAdmin(payload: CreateAdmin, auth_id: string) {
    return prisma.admin.create({
      data: {
        username: payload.username,
        role_id: 1, //ADMIN By Defautl
        auth_id,
      },
    });
  }

  public async assignRole(id: string, payload: AssignAdminRole) {
    return await prisma.admin.update({
      where: { id },
      data: {
        role_id: payload.role_id,
      },
    });
  }
}
