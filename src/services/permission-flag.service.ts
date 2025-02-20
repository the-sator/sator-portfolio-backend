import { PermissionFlagRepository } from "@/repositories/permission-flag.repository";

export class PermissionFlagService {
  private permissionFlagRepository: PermissionFlagRepository;
  constructor() {
    this.permissionFlagRepository = new PermissionFlagRepository();
  }
}
