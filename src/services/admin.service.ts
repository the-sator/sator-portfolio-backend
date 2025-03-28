import { AdminRepository } from "@/repositories/admin.repository";
import { SessionRepository } from "@/repositories/session.repository";
import {
  ThrowInternalServer,
  ThrowNotFound,
  ThrowUnauthorized,
} from "@/utils/exception";
import { decodeBase64 } from "@oslojs/encoding";
import { verifyTOTP } from "@oslojs/otp";
import config from "@/config/environment";

import { COOKIE, IdentityRole } from "@/types/base.type";
import type { UpdateTotp } from "@/types/auth.type";
import prisma from "@/loaders/prisma";
import Logger from "@/logger/logger";
import { decrypt } from "@/utils/encryption";
import type { AssignAdminRole } from "@/types/admin.type";
import type { Login, Signup } from "@/types/auth.type";
import { AuthRepository } from "@/repositories/auth.repository";
import {
  decodeToSessionId,
  generateSessionToken,
  hashPassword,
  verifyPassword,
} from "@/utils/auth_util";
import { SessionService } from "./session.service";
import { setCookie } from "@/utils/cookie";
import type { Response } from "express";

export class AdminService {
  private adminRepository: AdminRepository;
  private sessionRepository: SessionRepository;
  private authRepository: AuthRepository;
  private sessionService: SessionService;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.sessionRepository = new SessionRepository();
    this.authRepository = new AuthRepository();
    this.sessionService = new SessionService();
  }

  public async getAdmins() {
    return this.adminRepository.findAll();
  }

  public async getAllAdminIds() {
    return this.adminRepository.findAllIds();
  }
  //Permission
  public async assignRole(payload: AssignAdminRole) {
    return this.adminRepository.assignRole(payload.admin_id, payload);
  }

  //Auth
  public async signUp(payload: Signup) {
    const existingAdmin = await this.authRepository.checkByEmail(payload.email);
    if (existingAdmin) {
      return ThrowInternalServer("Admin Already Registered");
    }

    return prisma.$transaction(async (tx) => {
      const hashedPassword = await hashPassword(payload.password);

      const auth = await this.authRepository.createAuth(
        {
          email: payload.email,
          password: hashedPassword,
        },
        tx
      );
      const admin = await this.adminRepository.createAdmin(
        {
          username: payload.username,
        },
        auth.id
      );
      return admin;
    });
  }

  public async login(res: Response, payload: Login) {
    const auth = await this.authRepository.checkByEmail(payload.email);
    if (!auth) {
      return ThrowNotFound();
    }

    const isPasswordValid = await verifyPassword(
      payload.password,
      auth.password
    );
    if (!isPasswordValid) {
      return ThrowUnauthorized("Invalid User Credentials");
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

    if (!auth.admin) return ThrowUnauthorized("Admin cannot be found");

    const sessionToken = generateSessionToken();
    const session = await this.sessionService.createSession(
      {
        token: sessionToken,
        two_factor_verified: !!auth.totp_key,
      },
      { id: auth.admin.id, role: IdentityRole.ADMIN }
    );
    setCookie(res, COOKIE.ADMIN, sessionToken);
    return {
      ...auth.admin,
      token: sessionToken,
      expires_at: session.expires_at,
    };
  }

  public async getMe(token: string) {
    const sessionId = decodeToSessionId(token);
    const result = await this.sessionRepository.findSessionById(sessionId);
    if (result === null) {
      return ThrowUnauthorized();
    }
    const { admin, ...session } = result;
    if (admin === null) {
      return ThrowUnauthorized();
    }
    const time = session.expires_at.getTime();
    await this.sessionService.checkAndExtendSession(sessionId, time);
    return admin;
  }

  public async signout(token: string) {
    const id = decodeToSessionId(token);
    const result = await this.sessionService.invalidateSession(id);
    return result;
  }

  public async UpdateTotp(token: string, payload: UpdateTotp) {
    try {
      let key: Uint8Array;
      const sessionId = decodeToSessionId(token);
      const admin = await this.getMe(token);
      try {
        key = decodeBase64(payload.key);
      } catch {
        return ThrowInternalServer("Invalid Key, Failed To Decode");
      }
      if (key.byteLength !== 20) {
        return ThrowInternalServer("Invalid Key, ByteLength Invalid");
      }
      if (!verifyTOTP(key, 30, 6, payload.code)) {
        return ThrowInternalServer("Invalid Code");
      }
      const result = await prisma.$transaction(async (tx) => {
        await this.sessionRepository.updateTwoFactorVerified(sessionId, tx);
        return await this.authRepository.updateTotp(
          admin.auth_id,
          {
            code: payload.code,
            key: key,
          },
          tx
        );
      });

      return result;
    } catch (error) {
      Logger.error(error);
      return ThrowInternalServer(
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}
