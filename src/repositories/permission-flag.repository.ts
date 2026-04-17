import { db, type DrizzleTransaction } from "@/db";
import { permissionFlags } from "@/db/schema";
import type { CreatePermission } from "@/types/permission.type";

export class PermissionFlagRepository {
  public async create(
    role_id: string,
    payload: CreatePermission,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    return await client.insert(permissionFlags).values({
      role_id: role_id,
      resource_id: payload.resource_id,
      read: payload.read,
      write: payload.write,
      delete: payload.delete,
    });
  }

  public async upsert(
    role_id: string,
    payload: CreatePermission,
    tx: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;

    return await client
      .insert(permissionFlags)
      .values({
        role_id,
        resource_id: payload.resource_id,
        read: payload.read,
        write: payload.write,
        delete: payload.delete,
      })
      .onConflictDoUpdate({
        target: [permissionFlags.role_id, permissionFlags.resource_id],
        set: {
          read: payload.read,
          write: payload.write,
          delete: payload.delete,
        },
      });
  }

  public findAll() {
    return db.query.permissionFlags.findMany();
  }
}
