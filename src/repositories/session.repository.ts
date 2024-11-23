import prisma from "@/loaders/prisma";
import type { Session } from "@prisma/client";

export class SessionRepository {
  public async findSessionById(sessionId: string) {
    return await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        admin: {
          omit: {
            password: true,
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
        expiresAt: expiredAt,
      },
    });
  }

  public async createSession(session: Session) {
    await prisma.session.create({
      data: session,
    });
  }
}
