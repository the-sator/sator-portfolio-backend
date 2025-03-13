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

export const sumArray = (arr1: number[], arr2: number[]) => {
  const maxLength = Math.max(arr1.length, arr2.length);
  if (maxLength > 2) return [];
  const minLength = Math.min(arr1.length, arr2.length);
  const result = [];
  for (let i = 0; i < maxLength; i++) {
    const sum =
      (arr1[i] || arr1[minLength - 1]) + (arr2[i] || arr2[minLength - 1]);
    result.push(sum);
  }
  return result;
};

export const sumPriceRange = (arr: number[][]) => {
  const result = [0, 0];
  for (let i = 0; i < arr.length; i++) {
    const isFull = arr[i].length == 2;
    result[0] += arr[i][0] || 0;
    result[1] += isFull ? arr[i][1] : arr[i][0];
  }

  return result;
};
