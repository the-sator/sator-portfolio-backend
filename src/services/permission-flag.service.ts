import { PermissionFlagRepository } from "@/repositories/permission-flag.repository";
import type { CreatePermission } from "@/types/permission.type";

export class PermissionFlagService {
  private permissionFlagRepository: PermissionFlagRepository;
  constructor() {
    this.permissionFlagRepository = new PermissionFlagRepository();
  }
}
