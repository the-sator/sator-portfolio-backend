import prisma from "@/loaders/prisma";
import type { AdminRepository } from "@/repositories/admin.repository";
import { PermissionFlagRepository } from "@/repositories/permission-flag.repository";
import { ResourceRepository } from "@/repositories/resource.repository";
import { RoleRepository } from "@/repositories/role.repository";
import type { BaseModel } from "@/types/base.type";
import type { CheckRole, CreateRole, UpdateRole } from "@/types/role.type";
import { ThrowForbidden, ThrowInternalServer } from "@/utils/exception";

export class RoleService {
  private roleRepository: RoleRepository;
  private resourceRepository: ResourceRepository;
  private permissionFlagRepository: PermissionFlagRepository;
  constructor() {
    this.roleRepository = new RoleRepository();
    this.resourceRepository = new ResourceRepository();
    this.permissionFlagRepository = new PermissionFlagRepository();
  }

  public async findAll() {
    return await this.roleRepository.findAll();
  }

  public async findById(payload: BaseModel) {
    return await this.roleRepository.findById(Number(payload.id));
  }

  public async create(payload: CreateRole) {
    try {
      return await prisma.$transaction(async (tx) => {
        const role = await this.roleRepository.create(payload, tx);

        const permissionPromises = payload.permissions.map((permission) =>
          this.permissionFlagRepository.create(role.id, permission, tx)
        );
        await Promise.all(permissionPromises);

        return role;
      });
    } catch (error) {
      return ThrowInternalServer();
    }
  }
  public async update(role_id: number, payload: UpdateRole) {
    try {
      return await prisma.$transaction(async (tx) => {
        const role = await this.roleRepository.findById(role_id, tx);
        if (!role) {
          return ThrowForbidden("Role is Not Found");
        }
        const permissionPromises = payload.permissions.map((permission) =>
          this.permissionFlagRepository.upsert(role.id, permission, tx)
        );
        await Promise.all(permissionPromises);

        return role;
      });
    } catch (error) {
      return ThrowInternalServer();
    }
  }
  public async delete(payload: BaseModel) {
    return this.roleRepository.delete(Number(payload.id));
  }
  public async check(payload: CheckRole) {
    const role = await this.roleRepository.findById(payload.role_id);
    const resource = await this.resourceRepository.findByName(payload.resource);
    if (!role) {
      return ThrowInternalServer();
    }
    const permission = role.permissions.find(
      (p) => p.resource_id === resource?.id
    );
    if (!permission) {
      return ThrowForbidden("You have no permission");
    }

    const actionAllowed = permission["read"];
    if (!actionAllowed) {
      return ThrowForbidden("You have no permission");
    }
    return role;
  }
}
