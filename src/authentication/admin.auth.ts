import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import type { Admin, Session } from "@prisma/client";
import type { Request } from "express";
import prisma from "@/loaders/prisma";
import { SessionRepository } from "@/repositories/session.repository";
import { ThrowUnauthorized } from "@/utils/exception";
import type { Auth } from "@/types/auth.type";

export type AdminSessionValidationResult =
  | { session: Session; auth: Auth | null }
  | { session: null; auth: null };

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
    if (Date.now() >= session.expires_at.getTime()) {
      await this.sessionRepository.deleteSessionById(sessionId);
      return { session: null, auth: null };
    }
    if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      await this.sessionRepository.updateSessionExpiredAt(
        session.id,
        session.expires_at
      );
    }
    return { session, auth: admin };
  }

  public async createSession(
    token: string,
    admin_id: string,
    two_factor_verified: boolean
  ): Promise<Session> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const session: Session = {
      id: sessionId,
      admin_id,
      user_id: null,
      two_factor_verified: two_factor_verified,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await this.sessionRepository.createSession(session);
    return session;
  }

  public async invalidateSession(sessionId: string) {
    return await this.sessionRepository.deleteSessionById(sessionId);
  }

  public async getAdmin(req: Request) {
    const sessionCookie = req.cookies["session-admin"];
    if (!sessionCookie) {
      return ThrowUnauthorized(); // Or throw a custom error
    }

    const result = await this.validateSessionToken(sessionCookie);
    if (!result) {
      return ThrowUnauthorized();
    }

    return result;
  }

  public generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  }
}
