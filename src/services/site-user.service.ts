import { SiteUserRepository } from "@/repositories/site-user.repository";
import type { CreateSiteUser, SiteUserFilter } from "@/types/site-user.type";
import { getPaginationMetadata } from "@/utils/pagination";
import config from "@/config/environment";
import bcrypt from "bcrypt";
import type { Login } from "@/types/auth.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import { verifyTOTP } from "@oslojs/otp";
import { decrypt } from "@/utils/encryption";
import { SiteUserAuth } from "@/authentication/site-user.auth";
import type { BaseModel } from "@/types/base.type";
import type { Request } from "express";
export class SiteUserService {
  private siteUserRepository: SiteUserRepository;
  private siteUserAuth: SiteUserAuth;
  constructor() {
    this.siteUserRepository = new SiteUserRepository();
    this.siteUserAuth = new SiteUserAuth();
  }
  public async paginateSiteUsers(filter: SiteUserFilter) {
    const count = await this.siteUserRepository.count(filter);
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const siteUsers = await this.siteUserRepository.paginate(filter);
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
  public async create(payload: CreateSiteUser) {
    const saltRounds = config.passwordSalt;
    const passwordHash = await bcrypt.hash(
      payload.password,
      Number(saltRounds)
    );
    return this.siteUserRepository.create({
      ...payload,
      password: passwordHash,
    });
  }
  public async siteUserlogin(payload: Login) {
    const siteUser = await this.siteUserRepository.checkByEmailUsername(
      payload.email,
      payload.username
    );
    if (!siteUser) {
      return ThrowUnauthorized("Invalid User Credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      siteUser.password
    );
    if (!isPasswordValid) {
      return ThrowUnauthorized("Invalid User Credentials");
    }
    if (siteUser.totp_key) {
      const key = decrypt(Uint8Array.from(siteUser.totp_key));
      if (!verifyTOTP(key, 30, 6, String(payload.otp))) {
        return ThrowInternalServer("Invalid Code");
      }
    } else {
      if (payload.otp !== Number(config.defaultOTPCode)) {
        return ThrowUnauthorized("Invalid Code");
      }
    }

    const sessionToken = this.siteUserAuth.generateSessionToken();

    const session = await this.siteUserAuth.createSession(
      sessionToken,
      siteUser.id,
      !!siteUser.totp_key
    );

    return {
      user: {
        id: siteUser.id,
        email: siteUser.email,
        username: siteUser.username,
      },
      session: {
        id: session.id,
        token: sessionToken,
        expiredAt: session.expires_at,
      },
    };
  }

  public async siteUserSignout(req: Request) {
    const { session } = await this.siteUserAuth.getSiteUser(req);
    if (!session) return ThrowUnauthorized();
    const result = await this.siteUserAuth.invalidateSession(session.id);
    return result;
  }
}
