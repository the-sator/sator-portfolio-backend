import { LIMIT } from "@/constant/base";
import { db, type DrizzleTransaction } from "@/db";
import { users } from "@/db/schema";
import { eq, and, asc, count } from "drizzle-orm";
import type { UserFilter, CreateUser, AssignRole } from "./dto";
export class UserRepository {
  public buildFilter(filter: UserFilter) {
    const conds = [];
    if (filter.username) {
      conds.push(eq(users.username, filter.username));
    }
    return conds;
  }
  public async findAll() {
    return db.query.users.findMany();
  }

  public async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  public async paginate(filter: UserFilter) {
    const conds = this.buildFilter(filter);
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.page_size ? Number(filter.page_size) : LIMIT;
    const offset = (page - 1) * limit;
    return await db
      .select()
      .from(users)
      .where(and(...conds))
      .limit(limit)
      .orderBy(asc(users.created_at))
      .offset(offset);
  }

  public async count(filter: UserFilter) {
    const conds = this.buildFilter(filter);
    const [value] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conds));
    return value.count;
  }

  public async create(
    payload: CreateUser,
    auth_id: string,
    tx: DrizzleTransaction
  ) {
    const client = tx ? tx : db;
    return client.insert(users).values({
      username: payload.username,
      role_id: payload.role_id,
      auth_id,
    });
  }

  public async assignRole(id: string, payload: AssignRole) {
    const [result] = await db
      .update(users)
      .set({
        role_id: payload.role_id,
      })
      .where(eq(users.id, id))
      .returning();
    return result;
  }
}
