import prisma from "@/loaders/prisma";
import type { Signup } from "@/types/auth.type";
import type { Prisma } from "@prisma/client";
import type { EncryptedUpdateAdminTotp } from "./admin.repository";
import { encryptToBuffer } from "@/utils/encryption";
import type { SiteUserAuth } from "@/types/site-user.type";

export class AuthRepository {
  public async checkByEmail(email: string) {
    return prisma.auth.findUnique({
      where: { email },
      omit: {
        password: false, // The password field is now selected.
      },
      include: {
        user: true,
        admin: true,
        siteUser: true,
      },
    });
  }
  public async createAuth(
    payload: Omit<Signup, "username">,
    tx: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return client.auth.create({
      data: {
        email: payload.email,
        password: payload.password,
      },
    });
  }

  public async updateAuth(
    id: string,
    payload: SiteUserAuth,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return client.auth.update({
      where: { id },
      data: {
        email: payload.email,
        password: payload.password,
      },
      include: {
        user: true,
        admin: true,
        siteUser: true,
      },
    });
  }

  public async updateTotp(
    payload: EncryptedUpdateAdminTotp,
    tx: Prisma.TransactionClient
  ) {
    const encrypted = encryptToBuffer(payload.key);
    return tx.auth.update({
      where: { id: payload.id },
      data: {
        totp_key: encrypted,
      },
    });
  }
}
