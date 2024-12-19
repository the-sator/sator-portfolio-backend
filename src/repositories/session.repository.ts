import prisma from "@/loaders/prisma";
import type { Prisma, Session } from "@prisma/client";

export class SessionRepository {
  public async findSessionById(sessionId: string) {
    return await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        admin: {
          include: {
            role: true,
          },
          omit: {
            password: true,
            totp_key: true,
          },
        },

        user: {
          omit: {
            password: true,
            totp_key: true,
          },
        },
      },
    });
  }

  public async deleteSessionById(sessionId: string) {
    return await prisma.session.delete({ where: { id: sessionId } });
  }

  public async updateSessionExpiredAt(sessionId: string, expiredAt: Date) {
    return await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        expires_at: expiredAt,
      },
    });
  }

  public async createSession(session: Session) {
    await prisma.session.create({
      data: session,
    });
  }

  public async updateTwoFactorVerified(
    sessionId: string,
    tx: Prisma.TransactionClient
  ) {
    await tx.session.update({
      where: {
        id: sessionId,
      },
      data: {
        two_factor_verified: true,
      },
    });
  }
}
