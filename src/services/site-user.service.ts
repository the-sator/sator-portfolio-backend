import { SiteUserRepository } from "@/repositories/site-user.repository";
import type { SiteUserFilter } from "@/types/site-user.type";
import { getPaginationMetadata } from "@/utils/pagination";
import config from "@/config/environment";
import type { Login, Signup } from "@/types/auth.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import { verifyTOTP } from "@oslojs/otp";
import { decrypt } from "@/utils/encryption";
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
export class SiteUserService {
  private _siteUserRepository: SiteUserRepository;
  private _sessionRepository: SessionRepository;
  private _sessionService: SessionService;
  private _authRepository: AuthRepository;
  constructor() {
    this._siteUserRepository = new SiteUserRepository();
    this._sessionRepository = new SessionRepository();
    this._sessionService = new SessionService();
    this._authRepository = new AuthRepository();
  }
  public async paginateSiteUsers(filter: SiteUserFilter) {
    const count = await this._siteUserRepository.count(filter);
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const siteUsers = await this._siteUserRepository.paginate(filter);
    return {
      data: siteUsers,
      metadata: {
        current_page,
        page,
        page_count,
        count,
        page_size,
      },
    };
  }
  public async create(payload: Signup) {
    const passwordHash = await hashPassword(payload.password);
    return prisma.$transaction(async (tx) => {
      const auth = await this._authRepository.createAuth(
        {
          email: payload.email,
          password: passwordHash,
        },
        tx
      );
      return this._siteUserRepository.create(
        {
          username: payload.username,
        },
        auth.id,
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

    await this._sessionService.createSession(
      {
        token: sessionToken,
        two_factor_verified: !!auth.totp_key,
      },
      { user_id: auth.siteUser.id }
    );
    return auth.siteUser;
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
}
