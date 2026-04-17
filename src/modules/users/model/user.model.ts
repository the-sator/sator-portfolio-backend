import type { BaseModel } from "@/core/types/base.type";

export type User = BaseModel & {
  username: string;
  auth_id: string;
  totp_key?: Uint8Array | null;
  last_login?: Date | null;
  role_id: string;
};
