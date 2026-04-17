import type { SiteUser } from "@/modules/site-user/model/site-user.model";
import type { User } from "@/modules/users/model/user.model";
import type { BaseModel } from "@/core/types/base.type";

export type Auth = BaseModel & {
  email: string;
  password: string;
  totp_key: Uint8Array | null;
  last_login: Date | null;
  user?: User;
  site_user?: SiteUser;
};

export type AuthSessionValidationResult = Partial<Auth> | null;
