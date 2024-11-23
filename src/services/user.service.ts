import { UserRepository } from "@/repositories/user.repository";
import {
  CreateUserSchema,
  type CreateUser,
  type User,
} from "@/types/user.type";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async getUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
  public async createUser(payload: CreateUser): Promise<User> {
    return this.userRepository.addUser(payload);
  }
}
