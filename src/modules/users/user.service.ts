import { UserRepository } from "./user.repository";
import { getPaginationMeta } from "@/utils/pagination";
import { CacheService } from "@/services/cache.service";
import { db } from "@/db";
import type { SessionResponse } from "@/modules/auth/dto/session-response.dto";
import type { User } from "./model/user.model";
import type { PaginationResult } from "@/core/types/pagination.type";
import { RoleRepository } from "@/modules/role/role.repository";
import { RoleEnum } from "../role/model/role.enum";
import {
  ForbiddenException,
  UnauthorizedException,
} from "@/core/response/error/exception";
import type { AssignRole } from "./dto/assign-role.dto";
import { AuthService } from "../auth/auth.service";
import type { Signup, SignIn, UpdateTotp } from "../auth/dto";
import type { UserFilter } from "./dto/user-filter.dto";

export class UserService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;
  private cacheService: CacheService;
  private readonly authService: AuthService;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
    this.cacheService = new CacheService();
    this.authService = new AuthService();
  }

  public async getUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  public async paginateUsers(
    filter: UserFilter,
  ): Promise<PaginationResult<User>> {
    const count = await this.userRepository.count(filter);
    const meta = getPaginationMeta(filter, count);
    const users = await this.userRepository.paginate(filter);
    return { data: users, meta };
  }

  //Auth
  public async signUp(payload: Signup) {
    return db.transaction(async (tx) => {
      const auth = await this.authService.create(payload, tx);
      const role = await this.roleRepository.getRole(RoleEnum.USER);
      if (!role) throw new ForbiddenException({ message: "Invalid Role" });
      const admin = await this.userRepository.create(
        {
          username: payload.username,
          role_id: role.id,
        },
        auth.id as string,
        tx,
      );
      return admin;
    });
  }

  public async signin(payload: SignIn): Promise<SessionResponse> {
    return await this.authService.signin(payload);
  }

  public async assignRole(payload: AssignRole) {
    return this.userRepository.assignRole(payload.user_id, payload);
  }

  public async signout(token: string): Promise<void> {
    return await this.authService.signout(token);
  }

  public async getMe(token: string): Promise<User> {
    const auth = await this.authService.getMe(token);
    if (!auth || !auth.user) throw new UnauthorizedException();
    return auth.user;
  }

  public async updateTotp(token: string, payload: UpdateTotp) {
    return this.authService.updateTotp(token, payload);
  }
}
