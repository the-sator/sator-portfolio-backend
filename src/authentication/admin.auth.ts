import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import type { Admin, Session } from "@prisma/client";
import prisma from "@/loaders/prisma";
import { SessionRepository } from "@/repositories/session.repository";
import { ThrowUnauthorized } from "@/utils/exception";

export type AdminSessionValidationResult =
  | { session: Session; admin: Partial<Admin> }
  | { session: null; admin: null };

export class AdminAuth {
  private sessionRepository: SessionRepository;
  constructor() {
    this.sessionRepository = new SessionRepository();
  }
  public async validateSessionToken(
    token: string
  ): Promise<AdminSessionValidationResult> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const result = await this.sessionRepository.findSessionById(sessionId);
    if (result === null) {
      return ThrowUnauthorized();
    }
    const { admin, ...session } = result;
    if (Date.now() >= session.expiresAt.getTime()) {
      await this.sessionRepository.deleteSessionById(sessionId);
      return { session: null, admin: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      await this.sessionRepository.updateSessionExpiredAt(
        session.id,
        session.expiresAt
      );
    }
    return { session, admin };
  }

  public async createSession(
    token: string,
    adminId: string,
    two_factor_verified: boolean
  ): Promise<Session> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const session: Session = {
      id: sessionId,
      adminId,
      two_factor_verified: two_factor_verified,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await this.sessionRepository.createSession(session);
    return session;
  }

  public async invalidateSession(sessionId: string) {
    return await this.sessionRepository.deleteSessionById(sessionId);
  }

  public generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  }
}
