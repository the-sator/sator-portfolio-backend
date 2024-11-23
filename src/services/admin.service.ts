import { AdminRepository } from "@/repositories/admin.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import config from "@/config/environment";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import bcrypt from "bcrypt";

import type {
  AdminSessionValidationResult,
  ValidateSessionToken,
} from "@/types/base.type";
import type { CreateAdmin } from "@/types/admin.type";
import { AdminAuth } from "@/authentication/admin.auth";

export class AdminService {
  private adminRepository: AdminRepository;
  private adminAuth: AdminAuth;

  constructor() {
    this.adminRepository = new AdminRepository();
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

  public async login(payload: CreateAdmin) {
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

    const sessionToken = this.adminAuth.generateSessionToken();

    const session = await this.adminAuth.createSession(sessionToken, admin.id);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
      },
      session: {
        token: sessionToken,
        expiredAt: session.expiresAt,
      },
    };
  }

  public async signout(payload: ValidateSessionToken) {
    const result = await this.adminAuth.invalidateSession(payload.token);
    return result;
  }

  public async getSession(payload: ValidateSessionToken) {
    const result = await this.adminAuth.validateSessionToken(payload.token);
    return result;
  }
}
