import { SiteUserRepository } from "@/modules/site-user/site-user.repository";
import { getPaginationMetadata } from "@/utils/pagination";
import { env } from "@/libs";
import { verifyTOTP } from "@oslojs/otp";
import { decrypt, decryptApiKey, encryptApiKey } from "@/utils/encryption";
import { generateRandomUsername, getRandomString } from "@/utils/string";
import { SessionService } from "../session/session.service";
import { SiteMetricRepository } from "@/modules/site-metric/site-metric-repository";
import { authUtil } from "@/modules/auth/auth.util";
import { db } from "@/db";
import { AuthService } from "@/modules/auth/auth.service";
import type { PaginationResult } from "@/core/types/pagination.type";
import type { SiteUser } from "@/modules/site-user/model/site-user.model";
import type { CreateSiteUser } from "./dto/create-site-user.dto";
import {
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "@/core/response/error/exception";
import type { Auth } from "../auth/model/auth.model";
import type { SiteUserSignin } from "./dto/site-user-signin.dto";
import type { Onboarding } from "./dto/onboarding.dto";
import type { SiteUserFilter } from "./dto/site-user-filter.dto";
import type { UpdateTotp } from "../auth/dto/update-totp.dto";
export class SiteUserService {
  private readonly siteUserRepository: SiteUserRepository;
  private sessionService: SessionService;
  private authService: AuthService;
  private siteMetricRepository: SiteMetricRepository;
  constructor() {
    this.siteUserRepository = new SiteUserRepository();
    this.sessionService = new SessionService();
    this.authService = new AuthService();
    this.siteMetricRepository = new SiteMetricRepository();
  }
  public async paginateSiteUsers(
    filter: SiteUserFilter
  ): Promise<PaginationResult<SiteUser>> {
    const count = await this.siteUserRepository.count(filter);
    const meta = getPaginationMetadata(filter, count);
    const siteUsers = await this.siteUserRepository.paginate(filter);
    const decryptedSiteUsers = siteUsers.map((user) => ({
      ...user,
      api_key: decryptApiKey(user.api_key),
    }));
    return {
      data: decryptedSiteUsers,
      meta,
    };
  }
  public async create(payload: CreateSiteUser) {
    const passwordHash = await authUtil.hashPassword(env.DEFAULT_PASSWORD);
    return db.transaction(async (tx) => {
      // Create Default Auth for the website
      const username = payload.username || generateRandomUsername();
      const uniqueEmail = `${username}@sator-tech.live`;
      const apiKey = getRandomString();
      const encryptedKey = encryptApiKey(apiKey);

      const auth = await this.authService.create(
        {
          email: uniqueEmail,
          password: passwordHash,
        },
        tx
      );
      // Create the site record
      return this.siteUserRepository.create(
        {
          website_name: payload.website_name,
          link: payload.link,
          user_id: payload.user_id,
          username,
        },
        auth.id as string,
        encryptedKey,
        tx
      );
    });
  }
  // TODO: Solve Username Uniqueness Problem
  public async signin(id: string, payload: SiteUserSignin) {
    const siteUser = await this.siteUserRepository.findByUsername(
      payload.username
    );
    if (!siteUser) {
      throw new UnauthorizedException();
    }
    if (siteUser.id !== id) {
      throw new UnauthorizedException({
        message:
          env.NODE_ENV === "development"
            ? "Invalid Site User"
            : "Invalid Credentials",
      });
    }
    const { auth } = siteUser;
    if (!auth) {
      throw new InternalServerException({
        message: "Missing auth in siteUser ",
      });
    }

    const isPasswordValid = authUtil.verifyPassword(
      payload.password,
      auth.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    if (auth.totp_key) {
      const key = decrypt(Uint8Array.from(auth.totp_key));
      if (verifyTOTP(key, 30, 6, String(payload.otp))) {
        throw new UnauthorizedException({ message: "Invalid Code" });
      }
    } else {
      if (payload.otp !== Number(env.DEFAULT_OTP_CODE)) {
        throw new UnauthorizedException({ message: "Invalid Code" });
      }
    }

    const sessionToken = authUtil.generateSessionToken();

    const session = await this.sessionService.createSession({
      token: sessionToken,
      two_factor_verified: !!auth.totp_key,
      auth_id: auth.id as string,
    });
    return {
      token: sessionToken,
      expires_at: session.expires_at,
    };
  }

  public async getMe(token: string): Promise<Auth> {
    return this.authService.getMe(token);
  }

  public async signout(token: string): Promise<void> {
    return this.authService.signout(token);
  }

  public async checkIsRegistered(id: string) {
    const isRegistered = await this.siteUserRepository.checkIsRegister(id);
    return isRegistered;
  }

  public async updateAuth(
    id: string,
    token: string,
    payload: Onboarding
  ): Promise<Auth> {
    const sessionId = authUtil.decodeToSessionId(token);

    const result = await this.sessionService.findById(sessionId);
    if (result === null) {
      throw new UnauthorizedException();
    }

    return db.transaction(async (tx) => {
      if (!result || (result && !result.auth.site_user))
        throw new UnauthorizedException();
      if (result.auth.site_user.id !== id)
        throw new UnauthorizedException({
          message:
            process.env.NODE_ENV === "development"
              ? "Invalid Site User"
              : "Invalid Credentials",
        });
      const hashedPassword = await authUtil.hashPassword(payload.password);
      const auth = await this.authService.updatePassword(
        result.auth.id,
        hashedPassword,
        tx
      );
      await Promise.all([
        this.siteUserRepository.updateRegisteredAt(id, tx),
        this.siteUserRepository.updateUsername(id, payload.username, tx),
      ]);
      return auth;
    });
  }

  public async increaseView(key: string) {
    const site = await this.siteUserRepository.findByApiKey(key);
    if (!site) throw new NotFoundException({ message: "Site not found" });
    return await db.transaction(async (tx) => {
      const siteMetric = await this.siteMetricRepository.findByToday(
        site.id,
        tx
      );
      //If not found, then create new site metric
      if (!siteMetric) {
        await this.siteMetricRepository.createMetric(site.id, tx);
        return site;
      }
      await this.siteMetricRepository.increaseView(siteMetric.id, tx);
      return site;
    });
  }

  public async updateSiteUserTotp(token: string, payload: UpdateTotp) {
    return this.authService.updateTotp(token, payload);
  }
}
