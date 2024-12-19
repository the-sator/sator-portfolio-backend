import { AdminRepository } from "@/repositories/admin.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import config from "@/config/environment";
import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { verifyTOTP } from "@oslojs/otp";
import bcrypt from "bcrypt";

import type { BaseModel, ValidateSessionToken } from "@/types/base.type";
import type { CreateAdmin, UpdateAdminTotp } from "@/types/admin.type";
import { AdminAuth } from "@/authentication/admin.auth";
import prisma from "@/loaders/prisma";
import Logger from "@/logger/logger";
import { decrypt } from "@/utils/encryption";
import type { AssignAdminRole } from "@/types/admin.type";
import type { Login } from "@/types/auth.type";

export class AdminService {
  private adminRepository: AdminRepository;
  private sessionRepository: SessionRepository;
  private adminAuth: AdminAuth;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.sessionRepository = new SessionRepository();
    this.adminAuth = new AdminAuth();
  }

  public async getAdmins() {
    return this.adminRepository.findAll();
  }
  public async signUp(payload: CreateAdmin) {
    const existingAdmin = await this.adminRepository.findByEmail(payload.email);
    if (existingAdmin) {
      return ThrowInternalServer("User Already Registered");
    }

    //Encrypt Password
    const saltRounds = config.passwordSalt;
    const passwordHash = await bcrypt.hash(
      payload.password,
      Number(saltRounds)
    );

    const admin = await this.adminRepository.createAdmin({
      email: payload.email,
      password: passwordHash,
      username: payload.username,
    });

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
      },
    };
  }

  public async login(payload: Login) {
    const admin = await this.adminRepository.checkEmailAndUsername(
      payload.email,
      payload.username
    );
    if (!admin) {
      return ThrowUnauthorized("Invalid User Credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      admin.password
    );
    if (!isPasswordValid) {
      return ThrowUnauthorized("Invalid User Credentials");
    }

    if (admin.totp_key) {
      const key = decrypt(Uint8Array.from(admin.totp_key));
      if (!verifyTOTP(key, 30, 6, String(payload.otp))) {
        return ThrowInternalServer("Invalid Code");
      }
    } else {
      if (payload.otp !== Number(config.defaultOTPCode)) {
        return ThrowUnauthorized("Invalid Code");
      }
    }

    const sessionToken = this.adminAuth.generateSessionToken();

    const session = await this.adminAuth.createSession(
      sessionToken,
      admin.id,
      !!admin.totp_key
    );

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
      },
      session: {
        id: session.id,
        token: sessionToken,
        expiredAt: session.expires_at,
      },
    };
  }

  public async signout(payload: BaseModel) {
    const result = await this.adminAuth.invalidateSession(String(payload.id));
    return result;
  }

  public async updateAdminTotp(payload: UpdateAdminTotp) {
    try {
      let key: Uint8Array;
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
        await this.sessionRepository.updateTwoFactorVerified(
          payload.sessionId,
          tx
        );
        return await this.adminRepository.updateTotp(
          {
            code: payload.code,
            key: key,
            sessionId: payload.sessionId,
            id: payload.id,
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
  public async assignRole(payload: AssignAdminRole) {
    return this.adminRepository.assignRole(payload.admin_id, payload);
  }
}
