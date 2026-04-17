import { db, type DrizzleTransaction } from "@/db";
import { siteUsers } from "@/db/schema";
import type { SiteUser } from "@/modules/site-user/model/site-user.model";
import { encryptApiKey } from "@/utils/encryption";
import { and, asc, count, eq, isNotNull, like } from "drizzle-orm";
import type { SiteUserFilter } from "./dto/site-user-filter.dto";
import type { CreateSiteUser } from "./dto/create-site-user.dto";
export class SiteUserRepository {
  private buildFilter = (filter: SiteUserFilter) => {
    const conditions = [];
    if (filter.username) {
      conditions.push(like(siteUsers.username, `%${filter.username}%`));
    }
    return conditions;
  };

  public async paginate(filter: SiteUserFilter): Promise<SiteUser[]> {
    const conds = this.buildFilter(filter);
    return await db
      .select()
      .from(siteUsers)
      .where(and(...conds))
      .limit(filter.page_size)
      .orderBy(asc(siteUsers.created_at))
      .offset((filter.page - 1) * filter.page_size);
  }

  public async findById(id: string): Promise<SiteUser | undefined> {
    return await db.query.siteUsers.findFirst({
      where: eq(siteUsers.id, id),
    });
  }

  public async findByUsername(username: string): Promise<SiteUser | undefined> {
    return await db.query.siteUsers.findFirst({
      where: eq(siteUsers.username, username),
      with: {
        auth: true,
      },
    });
  }

  public async findByApiKey(api_key: string): Promise<SiteUser | undefined> {
    const encrypted = encryptApiKey(api_key);
    return await db.query.siteUsers.findFirst({
      where: eq(siteUsers.api_key, encrypted),
    });
  }

  public async count(filter: SiteUserFilter): Promise<number> {
    const conds = this.buildFilter(filter);
    const [value] = await db
      .select({ count: count() })
      .from(siteUsers)
      .where(and(...conds));
    return value.count;
  }

  public async checkIsRegister(id: string): Promise<boolean> {
    const result = await db.query.siteUsers.findFirst({
      where: and(eq(siteUsers.id, id), isNotNull(siteUsers.registered_at)),
    });
    return !!result;
  }

  public async create(
    payload: CreateSiteUser,
    auth_id: string,
    apiKey: string,
    tx: DrizzleTransaction,
  ): Promise<SiteUser> {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(siteUsers)
      .values({
        ...payload,
        username: payload.username || "Unknown",
        api_key: apiKey,
        auth_id,
      })
      .returning();
    return result;
  }

  public async updateRegisteredAt(
    id: string,
    tx?: DrizzleTransaction,
  ): Promise<SiteUser | undefined> {
    const client = tx ? tx : db;
    const [result] = await client
      .update(siteUsers)
      .set({
        registered_at: new Date(),
      })
      .where(eq(siteUsers.id, id))
      .returning();
    return result;
  }

  public async updateUsername(
    id: string,
    username: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(siteUsers)
      .set({
        username,
      })
      .where(eq(siteUsers.id, id))
      .returning();
    return result;
  }
}
