import { authUtil } from "./auth.util";
import { db, type DrizzleTransaction } from "@/db";
import { AuthRepository } from "./auth.repository";
import type { Auth } from "./model/auth.model";
import { decrypt } from "@/utils";
import { verifyTOTP } from "@oslojs/otp";
import { env } from "@/libs";
import { SessionService } from "../session/session.service";
import type { SessionResponse } from "./dto/session-response.dto";
import {
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "@/core/response/error/exception";
import type { CreateAuth } from "./dto/create-auth.dto";
import type { SignIn } from "./dto/sign-in.dto";
import { decodeBase64 } from "@oslojs/encoding";
import type { UpdateTotp } from "./dto/update-totp.dto";

export class AuthService {
  private readonly authRepository: AuthRepository;
  private readonly sessionService: SessionService;
  constructor() {
    this.authRepository = new AuthRepository();
    this.sessionService = new SessionService();
  }
  public async create(
    payload: CreateAuth,
    tx?: DrizzleTransaction
  ): Promise<Auth> {
    console.log("payload.password:", payload.password);
    const passwordHash = await authUtil.hashPassword(payload.password);
    return this.authRepository.create(
      {
        email: payload.email,
        password: passwordHash,
      },
      tx
    );
  }

  public async signin(payload: SignIn): Promise<SessionResponse> {
    const auth = await this.findByEmail(payload.email);
    if (!auth) {
      throw new NotFoundException({ message: "User not found" });
    }

    const isPasswordValid = await authUtil.verifyPassword(
      payload.password,
      auth.password
    );
    console.log("data", payload.password, auth.password);

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

    // try {
    //   this._cacheService.saveAuth(sessionToken, auth);
    // } catch (error) {
    //   logger.error(error);
    // }

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

  public async signout(token: string) {
    const id = authUtil.decodeToSessionId(token);
    await this.sessionService.invalidateSession(id);
  }

  //TODO: Refine return values
  public async getMe(token: string): Promise<Auth> {
    const sessionId = authUtil.decodeToSessionId(token);
    const result = await this.sessionService.findById(sessionId);
    if (!result) throw new UnauthorizedException();
    // if (!result.auth.admin) throw new UnauthorizedException();
    const time = result.expires_at.getTime();
    await this.sessionService.checkAndExtendSession(sessionId, time);
    return result.auth;
  }

  public async findByEmail(email: string): Promise<Auth | undefined> {
    return await this.authRepository.findByEmail(email);
  }

  public async updateTotp(
    token: string,
    payload: UpdateTotp
  ): Promise<Auth | undefined> {
    const sessionId = authUtil.decodeToSessionId(token);
    const auth = await this.getMe(token);

    if (!auth) throw new ForbiddenException();

    return await db.transaction(async (tx) => {
      await this.sessionService.updateTwoFactorVerified(sessionId, tx);
      const key = decodeBase64(payload.key);
      if (key.byteLength !== 20)
        throw new InternalServerException({
          message: "Invalid Key, ByteLength Invalid",
        });

      if (!verifyTOTP(key, 30, 6, payload.code))
        throw new UnauthorizedException({ message: "Invalid Code" });

      return await this.authRepository.updateTotp(
        sessionId,
        {
          ...payload,
          key,
        },
        tx
      );
    });
  }

  public updatePassword(
    id: string,
    newPassword: string,
    tx?: DrizzleTransaction
  ) {
    return this.authRepository.updatePassword(id, newPassword, tx);
  }
}
