import prisma from "@/loaders/prisma";
import type { Prisma, SiteUserSession } from "@prisma/client";

export class SiteUserSessionRepository {
  public async findSessionById(sessionId: string) {
    return await prisma.siteUserSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        site_user: {
          omit: {
            password: true,
            totp_key: true,
          },
        },
      },
    });
  }
  public async deleteSessionById(sessionId: string) {
    return await prisma.siteUserSession.delete({ where: { id: sessionId } });
  }

  public async updateSessionExpiredAt(sessionId: string, expiredAt: Date) {
    return await prisma.siteUserSession.update({
      where: {
        id: sessionId,
      },
      data: {
        expires_at: expiredAt,
      },
    });
  }

  public async createSession(session: SiteUserSession) {
    await prisma.siteUserSession.create({
      data: session,
    });
  }

  public async updateTwoFactorVerified(
    sessionId: string,
    tx: Prisma.TransactionClient
  ) {
    await tx.siteUserSession.update({
      where: {
        id: sessionId,
      },
      data: {
        two_factor_verified: true,
      },
    });
  }
}
