import { encryptToBuffer } from "@/utils/encryption";
import { db, type DrizzleTransaction } from "@/db";
import { eq } from "drizzle-orm";
import { auths } from "@/db/schema";
import type { Signup } from "./dto/sign-up.dto";
import type { DecryptedTotp } from "./dto/update-totp.dto";

export class AuthRepository {
  public async findByEmail(email: string) {
    return db.query.auths.findFirst({
      where: eq(auths.email, email),
      with: {
        user: true,
        site_user: true,
      },
    });
  }

  public async create(
    payload: Omit<Signup, "username">,
    tx?: DrizzleTransaction
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(auths)
      .values({
        email: payload.email,
        password: payload.password,
      })
      .returning();
    return result;
  }

  public async updatePassword(
    id: string,
    password: string,
    tx?: DrizzleTransaction
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(auths)
      .set({
        password,
      })
      .where(eq(auths.id, id))
      .returning();
    return result;
  }

  public async updateTotp(
    id: string,
    payload: DecryptedTotp,
    tx?: DrizzleTransaction
  ) {
    const encrypted = encryptToBuffer(payload.key);
    const encryptedUint8 = new Uint8Array(encrypted);
    const client = tx ? tx : db;
    const [result] = await client
      .update(auths)
      .set({
        totp_key: encryptedUint8,
      })
      .where(eq(auths.id, id))
      .returning();
    return result;
  }
}
