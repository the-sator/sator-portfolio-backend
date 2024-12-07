import prisma from "@/loaders/prisma";
import type {
  AssignAdminRole,
  CreateAdmin,
  UpdateAdminTotp,
} from "@/types/admin.type";
import { encrypt, encryptToBuffer } from "@/utils/encryption";
import { exclude } from "@/utils/fetch";
import type { Prisma } from "@prisma/client";

export interface EncryptedUpdateAdminTotp extends Omit<UpdateAdminTotp, "key"> {
  key: Uint8Array;
}

export class AdminRepository {
  public async findAll() {
    return await prisma.admin.findMany({
      omit: {
        password: true,
      },
      include: {
        role: true,
      },
    });
  }
  public async findByEmail(email: string) {
    return prisma.admin.findUnique({
      where: { email },
    });
  }
  public async findById(id: string) {
    return prisma.admin.findUnique({
      where: { id },
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
        role_id: 1, //ADMIN By Defautl
      },
    });
  }
  public async updateTotp(
    payload: EncryptedUpdateAdminTotp,
    tx: Prisma.TransactionClient
  ) {
    const encrypted = encryptToBuffer(payload.key);
    return tx.admin.update({
      where: { id: payload.id },
      data: {
        totp_key: encrypted,
      },
      omit: {
        password: true,
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
