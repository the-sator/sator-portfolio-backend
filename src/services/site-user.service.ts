import { SiteUserRepository } from "@/repositories/site-user.repository";
import type {
  CreateSiteUser,
  SiteUserAuth,
  SiteUserFilter,
} from "@/types/site-user.type";
import { getPaginationMetadata } from "@/utils/pagination";
import config from "@/config/environment";
import type { Login } from "@/types/auth.type";
import {
  ThrowForbidden,
  ThrowInternalServer,
  ThrowUnauthorized,
} from "@/utils/exception";
import { verifyTOTP } from "@oslojs/otp";
import {
  decrypt,
  decryptApiKey,
  encryptApiKey,
  getRandomString,
} from "@/utils/encryption";
import {
  decodeToSessionId,
  generateSessionToken,
  hashPassword,
  verifyPassword,
} from "@/utils/auth_util";
import prisma from "@/loaders/prisma";
import { AuthRepository } from "@/repositories/auth.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { SessionService } from "./session.service";
import type { Response } from "express";
import { SiteMetricRepository } from "@/repositories/site-metric-repository";
import { randomUUID } from "crypto";
import { IdentityRole } from "@/types/base.type";
export class SiteUserService {
  private _siteUserRepository: SiteUserRepository;
  private _sessionRepository: SessionRepository;
  private _sessionService: SessionService;
  private _authRepository: AuthRepository;
  private _siteMetricRepository: SiteMetricRepository;
  constructor() {
    this._siteUserRepository = new SiteUserRepository();
    this._sessionRepository = new SessionRepository();
    this._sessionService = new SessionService();
    this._authRepository = new AuthRepository();
    this._siteMetricRepository = new SiteMetricRepository();
  }
  public async paginateSiteUsers(filter: SiteUserFilter) {
    const count = await this._siteUserRepository.count(filter);
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const siteUsers = await this._siteUserRepository.paginate(filter);
    const decryptedSiteUsers = siteUsers.map((user) => ({
      ...user,
      api_key: decryptApiKey(user.api_key),
    }));
    return {
      data: decryptedSiteUsers,
      metadata: {
        current_page,
        page,
        page_count,
        count,
        page_size,
      },
    };
  }
  public async create(payload: CreateSiteUser) {
    const passwordHash = await hashPassword(config.defaultPassword);
    return prisma.$transaction(async (tx) => {
      // Create Default Auth for the website
      const uniqueEmail = `user-${randomUUID()}@sator-tech.live`;
      const apiKey = getRandomString();
      const encryptedKey = encryptApiKey(apiKey);
      const auth = await this._authRepository.createAuth(
        {
          email: uniqueEmail,
          password: passwordHash,
        },
        tx
      );
      // Create the site record
      return this._siteUserRepository.create(
        {
          website_name: payload.website_name,
          link: payload.link,
          user_id: payload.user_id,
        },
        auth.id,
        encryptedKey,
        tx
      );
    });
  }

  public async siteUserlogin(payload: Login) {
    const auth = await this._authRepository.checkByEmail(payload.email);
    if (!auth) {
      return ThrowUnauthorized("Invalid Credentials");
    }

    const isPasswordValid = verifyPassword(payload.password, auth.password);
    if (!isPasswordValid) {
      return ThrowUnauthorized("Invalid Credentials");
    }
    if (auth.totp_key) {
      const key = decrypt(Uint8Array.from(auth.totp_key));
      if (!verifyTOTP(key, 30, 6, String(payload.otp))) {
        return ThrowInternalServer("Invalid Code");
      }
    } else {
      if (payload.otp !== Number(config.defaultOTPCode)) {
        return ThrowUnauthorized("Invalid Code");
      }
    }

    const sessionToken = generateSessionToken();
    if (!auth.siteUser) return ThrowUnauthorized("SiteUser cannot be found");

    const session = await this._sessionService.createSession(
      {
        token: sessionToken,
        two_factor_verified: !!auth.totp_key,
      },
      { id: auth.siteUser.id, role: IdentityRole.SITE_USER }
    );
    return {
      ...auth.siteUser,
      token: sessionToken,
      expires_at: session.expires_at,
    };
  }

  public async getMe(token: string) {
    const sessionId = decodeToSessionId(token);
    const result = await this._sessionRepository.findSessionById(sessionId);
    if (result === null) {
      return ThrowUnauthorized();
    }
    const { site_user, ...session } = result;
    if (site_user === null) {
      return ThrowUnauthorized();
    }
    const time = session.expires_at.getTime();
    await this._sessionService.checkAndExtendSession(sessionId, time);
    return site_user;
  }

  public async signout(token: string) {
    const id = decodeToSessionId(token);
    const result = await this._sessionService.invalidateSession(id);
    return result;
  }

  public async checkIsRegistered(id: string) {
    const isRegistered = await this._siteUserRepository.checkIsRegister(id);
    return isRegistered;
  }

  public async firstLogin(res: Response, id: string, payload: SiteUserAuth) {
    const auth = await this._authRepository.checkByEmail(payload.email);
    console.log("auth:", auth);
    if (!auth) {
      return ThrowUnauthorized("Invalid Credentials");
    }
    const isPasswordValid = await verifyPassword(
      payload.password,
      auth.password
    );
    if (!isPasswordValid) {
      return ThrowUnauthorized("Invalid Credentials");
    }

    if (!auth.siteUser || auth.siteUser.id !== id) {
      return ThrowUnauthorized(
        process.env.NODE_ENV === "development"
          ? "Invalid Site User"
          : "Invalid Credentials"
      );
    }

    const sessionToken = generateSessionToken();
    if (!auth.siteUser) return ThrowUnauthorized("SiteUser cannot be found");

    const session = await this._sessionService.createSession(
      {
        token: sessionToken,
        two_factor_verified: !!auth.totp_key,
      },
      { id: auth.siteUser.id, role: IdentityRole.SITE_USER }
    );
    return {
      ...auth.siteUser,
      token: sessionToken,
      expires_at: session.expires_at,
    };
  }
  public async updateAuth(id: string, token: string, payload: SiteUserAuth) {
    const sessionId = decodeToSessionId(token);
    console.log("sessionId:", sessionId);
    const result = await this._sessionRepository.findSessionById(sessionId);
    if (result === null) {
      return ThrowUnauthorized();
    }

    const isDuplicate = await this._authRepository.checkByEmail(payload.email);
    if (isDuplicate) {
      return ThrowForbidden("Duplicate Email");
    }

    return prisma.$transaction(async (tx) => {
      if (!result.site_user) return ThrowUnauthorized();
      if (result.site_user.id !== id)
        return ThrowUnauthorized(
          process.env.NODE_ENV === "development"
            ? "Invalid Site User"
            : "Invalid Credentials"
        );
      const hashedPassword = await hashPassword(payload.password);
      const auth = await this._authRepository.updateAuth(
        result.site_user.auth_id,
        {
          email: payload.email,
          password: hashedPassword,
        },
        tx
      );
      await this._siteUserRepository.updateRegisteredAt(id, tx);
      return auth.siteUser;
    });
  }

  public async increaseView(id: string) {
    const site = await this._siteUserRepository.findById(id);
    if (!site) return ThrowForbidden("No Record Found");
    return await prisma.$transaction(async (tx) => {
      const siteMetric = await this._siteMetricRepository.findByToday(
        site.id,
        tx
      );
      //If not found, then create new site metric
      if (!siteMetric) {
        await this._siteMetricRepository.createMetric(site.id, tx);
        return site;
      }
      await this._siteMetricRepository.increaseView(siteMetric.id, tx);
      return site;
    });
  }
}
