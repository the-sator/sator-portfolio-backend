import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";
import { randomUUID } from "crypto";

export function getRandomString(): string {
  const random: RandomReader = {
    read(bytes: Uint8Array): void {
      crypto.getRandomValues(bytes);
    },
  };
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return generateRandomString(random, alphabet, 32);
}
export function generateRandomUsername(): string {
  const prefix = ["ream", "neak", "eyso", "makara", "krud", "hanuman", "yeak"];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const shortUuid = randomUUID().split("-")[0]; // Takes first segment of UUID
  return `${randomPrefix}-${shortUuid}`;
}
