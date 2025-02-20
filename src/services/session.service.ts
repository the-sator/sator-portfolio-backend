import { SESSION_EXPIRES_DATE_MS } from "@/constant/base";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import type { Session } from "@prisma/client";
import { SessionRepository } from "@/repositories/session.repository";
import type { CreateSession } from "@/types/session.type";
import type { EntityID } from "@/types/base.type";

export class SessionService {
  private sessionRepository: SessionRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  public async createSession(
    payload: CreateSession,
    entity: EntityID
  ): Promise<Session> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(payload.token))
    );
    const session: Session = {
      id: sessionId,
      user_id: entity.user_id ?? null,
      admin_id: entity.admin_id ?? null,
      site_user_id: entity.site_user_id ?? null,
      two_factor_verified: payload.two_factor_verified,
      expires_at: new Date(Date.now() + SESSION_EXPIRES_DATE_MS),
    };
    await this.sessionRepository.createSession(session);
    return session;
  }

  public async invalidateSession(id: string) {
    return await this.sessionRepository.deleteSessionById(id);
  }

  public async checkAndExtendSession(id: string, time: number) {
    if (Date.now() >= time) {
      await this.sessionRepository.deleteSessionById(id);
      return { session: null, auth: null };
    }
    if (Date.now() >= time - SESSION_EXPIRES_DATE_MS) {
      const extendedTime = new Date(Date.now() + SESSION_EXPIRES_DATE_MS);
      await this.sessionRepository.updateSessionExpiredAt(id, extendedTime);
    }
  }
}
