import { createCipheriv, createDecipheriv } from "crypto";
import { DynamicBuffer } from "@oslojs/binary";
import { decodeBase64 } from "@oslojs/encoding";
import config from "@/config/environment";
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";
const key = decodeBase64(config.encryptionCode ?? "");
export function encrypt(data: Uint8Array): Uint8Array {
  const iv = new Uint8Array(16);
  crypto.getRandomValues(iv);
  const cipher = createCipheriv("aes-128-gcm", key, iv);
  const encrypted = new DynamicBuffer(0);
  encrypted.write(iv);
  const encryptedData = cipher.update(data);
  encrypted.write(Uint8Array.from(encryptedData));

  const finalData = cipher.final();
  encrypted.write(Uint8Array.from(finalData));

  encrypted.write(Uint8Array.from(cipher.getAuthTag()));
  return encrypted.bytes();
}

export function encryptToBuffer(data: Uint8Array): Buffer {
  const iv = new Uint8Array(16);
  crypto.getRandomValues(iv);
  const cipher = createCipheriv("aes-128-gcm", key, iv);
  const encrypted = new DynamicBuffer(0);

  encrypted.write(iv);
  encrypted.write(cipher.update(data));
  encrypted.write(cipher.final());
  encrypted.write(cipher.getAuthTag());

  return Buffer.from(encrypted.bytes()); // Convert to Buffer
}

export function encryptString(data: string): Uint8Array {
  return encrypt(new TextEncoder().encode(data));
}

export function decrypt(encrypted: Uint8Array): Uint8Array {
  if (encrypted.byteLength < 33) {
    throw new Error("Invalid data");
  }
  const iv = encrypted.slice(0, 16);
  const authTag = encrypted.slice(encrypted.byteLength - 16);

  const decipher = createDecipheriv("aes-128-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = new DynamicBuffer(0);
  decrypted.write(
    decipher.update(encrypted.slice(16, encrypted.byteLength - 16))
  );
  decrypted.write(decipher.final());
  return decrypted.bytes();
}

export function decryptToString(data: Uint8Array): string {
  return new TextDecoder().decode(decrypt(data));
}

export function encryptApiKey(text: string): string {
  const secretKey = Buffer.from(config.api_key.secret, "hex");
  const iv = Buffer.from(config.api_key.iv, "hex");
  const cipher = createCipheriv(config.api_key.algo, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptApiKey(key: string): string {
  const secretKey = Buffer.from(config.api_key.secret, "hex");
  const iv = Buffer.from(config.api_key.iv, "hex");
  const decipher = createDecipheriv(config.api_key.algo, secretKey, iv);
  let decrypted = decipher.update(key, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

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
