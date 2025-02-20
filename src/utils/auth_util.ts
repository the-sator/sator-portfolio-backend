import { SESSION_EXPIRES_DATE_MS } from "@/constant/base";
import { sha256 } from "@oslojs/crypto/sha2";
import config from "@/config/environment";
import bcrypt from "bcrypt";

import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import type { Session } from "@prisma/client";

export function decodeToSessionId(token: string) {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function hashPassword(password: string) {
  const saltRounds = config.passwordSalt;
  return await bcrypt.hash(password, Number(saltRounds));
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}
