import { UserRepository } from "@/repositories/user.repository";
import { type CreateUser, type UserFilter } from "@/types/user.type";
import config from "@/config/environment";
import bcrypt from "bcrypt";
import { LIMIT } from "@/constant/base";
import { getPaginationMetadata } from "@/utils/pagination";
import type { Login } from "@/types/auth.type";
import { ThrowInternalServer, ThrowUnauthorized } from "@/utils/exception";
import { verifyTOTP } from "@oslojs/otp";
import { decrypt } from "@/utils/encryption";
import { UserAuth } from "@/authentication/user.auth";

export class UserService {
  private userRepository: UserRepository;
  private userAuth: UserAuth;

  constructor() {
    this.userRepository = new UserRepository();
    this.userAuth = new UserAuth();
  }

  public async getUsers() {
    return await this.userRepository.findAll();
  }

  public async paginateUsers(filter: UserFilter) {
    const count = await this.userRepository.count(filter);
    const { current_page, page_size, page } = getPaginationMetadata(
      filter,
      count
    );
    const users = await this.userRepository.paginate(filter);
    return { data: users, metadata: { count, current_page, page_size, page } };
  }

  public async createUser(payload: CreateUser) {
    const saltRounds = config.passwordSalt;
    const passwordHash = await bcrypt.hash(
      payload.password,
      Number(saltRounds)
    );
    return this.userRepository.addUser({
      email: payload.email,
      password: passwordHash,
      username: payload.username,
    });
  }

  public async login(payload: Login) {
    const user = await this.userRepository.checkEmailAndUsername(
      payload.email,
      payload.username
    );
    if (!user) {
      return ThrowUnauthorized("Invalid User Credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password
    );
    if (!isPasswordValid) {
      return ThrowUnauthorized("Invalid User Credentials");
    }

    if (user.totp_key) {
      const key = decrypt(Uint8Array.from(user.totp_key));
      if (!verifyTOTP(key, 30, 6, String(payload.otp))) {
        return ThrowInternalServer("Invalid Code");
      }
    } else {
      if (payload.otp !== Number(config.defaultOTPCode)) {
        return ThrowUnauthorized("Invalid Code");
      }
    }

    const sessionToken = this.userAuth.generateSessionToken();

    const session = await this.userAuth.createSession(
      sessionToken,
      user.id,
      !!user.totp_key
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      session: {
        id: session.id,
        token: sessionToken,
        expiredAt: session.expires_at,
      },
    };
  }
}
