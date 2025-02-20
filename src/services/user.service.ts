import { UserRepository } from "@/repositories/user.repository";
import { type UserFilter } from "@/types/user.type";
import config from "@/config/environment";
import bcrypt from "bcrypt";
import { getPaginationMetadata } from "@/utils/pagination";
import type { Login, Signup } from "@/types/auth.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import { verifyTOTP } from "@oslojs/otp";
import { decrypt } from "@/utils/encryption";
import { CacheService } from "./cache.service";
import Logger from "@/logger/logger";
import {
  decodeToSessionId,
  generateSessionToken,
  hashPassword,
} from "@/utils/auth_util";
import { AuthRepository } from "@/repositories/auth.repository";
import { SessionService } from "./session.service";
import prisma from "@/loaders/prisma";
import { SessionRepository } from "@/repositories/session.repository";

export class UserService {
  private _userRepository: UserRepository;
  private _authRepository: AuthRepository;
  private _sessionRepository: SessionRepository;
  private _sessionService: SessionService;
  private _cacheService: CacheService;

  constructor() {
    this._userRepository = new UserRepository();
    this._authRepository = new AuthRepository();
    this._sessionRepository = new SessionRepository();
    this._sessionService = new SessionService();
    this._cacheService = new CacheService();
  }

  public async getUsers() {
    return await this._userRepository.findAll();
  }

  public async paginateUsers(filter: UserFilter) {
    const count = await this._userRepository.count(filter);
    const { current_page, page_size, page } = getPaginationMetadata(
      filter,
      count
    );
    const users = await this._userRepository.paginate(filter);
    return { data: users, metadata: { count, current_page, page_size, page } };
  }

  public async signup(payload: Signup) {
    const passwordHash = await hashPassword(payload.password);
    return prisma.$transaction(async (tx) => {
      const auth = await this._authRepository.createAuth(
        {
          email: payload.email,
          password: passwordHash,
        },
        tx
      );
      return this._userRepository.addUser(
        {
          username: payload.username,
        },
        auth.id,
        tx
      );
    });
  }

  public async login(payload: Login) {
    const auth = await this._authRepository.checkByEmail(payload.email);
    if (!auth) {
      return ThrowUnauthorized("Invalid Credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      auth.password
    );
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

    try {
      this._cacheService.saveAuth(sessionToken, auth);
    } catch (error) {
      Logger.error(error);
    }
    if (!auth.user) return ThrowUnauthorized("User cannot be found");

    await this._sessionService.createSession(
      {
        token: sessionToken,
        two_factor_verified: !!auth.totp_key,
      },
      { user_id: auth.user.id }
    );

    return auth.user;
  }

  public async getMe(token: string) {
    const sessionId = decodeToSessionId(token);
    const result = await this._sessionRepository.findSessionById(sessionId);
    if (result === null) {
      return ThrowUnauthorized();
    }
    const { user, ...session } = result;
    if (user === null) {
      return ThrowUnauthorized();
    }
    const time = session.expires_at.getTime();
    await this._sessionService.checkAndExtendSession(sessionId, time);
    return user;
  }
}
