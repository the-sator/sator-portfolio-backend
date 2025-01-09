import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import type { Request } from "express";
import prisma from "@/loaders/prisma";
import { SessionRepository } from "@/repositories/session.repository";
import { ThrowUnauthorized } from "@/utils/exception";
import type { SiteUser, SiteUserSession } from "@prisma/client";
import { SiteUserSessionRepository } from "@/repositories/site-user-session.repository";

export type SiteUserSessionValidationResult =
  | { session: SiteUserSession; auth: Omit<SiteUser, "password" | "totp_key"> }
  | { session: null; auth: null };

export class SiteUserAuth {
  private siteUserSessionRepository: SiteUserSessionRepository;
  constructor() {
    this.siteUserSessionRepository = new SiteUserSessionRepository();
  }
  public async validateSessionToken(
    token: string
  ): Promise<SiteUserSessionValidationResult> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const result = await this.siteUserSessionRepository.findSessionById(
      sessionId
    );
    if (result === null) {
      return ThrowUnauthorized();
    }
    const { site_user, ...session } = result;

    if (Date.now() >= session.expires_at.getTime()) {
      await this.siteUserSessionRepository.deleteSessionById(sessionId);
      return { session: null, auth: null };
    }
    if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      await this.siteUserSessionRepository.updateSessionExpiredAt(
        session.id,
        session.expires_at
      );
    }
    return { session, auth: site_user };
  }

  public async createSession(
    token: string,
    site_user_id: string,
    two_factor_verified: boolean
  ): Promise<SiteUserSession> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const session: SiteUserSession = {
      id: sessionId,
      site_user_id,
      two_factor_verified: two_factor_verified,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await this.siteUserSessionRepository.createSession(session);
    return session;
  }

  public async invalidateSession(sessionId: string) {
    return await this.siteUserSessionRepository.deleteSessionById(sessionId);
  }

  public async getSiteUser(req: Request) {
    const sessionCookie = req.cookies["session-site-user"];
    if (!sessionCookie) {
      return ThrowUnauthorized();
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
