import type { Admin, Session, User } from "@prisma/client";
import { z } from "zod";

export const SignUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required" })
    .max(20, {
      message: "Username must not exceed 20 characters",
    }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const LoginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required" })
    .max(20, {
      message: "Username must not exceed 20 characters",
    }),
  email: z.string().email({ message: "Invalid email format" }),
  otp: z.number().lt(999999, { message: "Must be 6 characters long" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type SessionResult = {
  token: string;
  expires_at: Date;
};

export type Auth = Omit<Admin, "password" | "totp_key"> &
  Omit<User, "password" | "totp_key"> &
  SessionResult;

export type AuthSessionValidationResult = Partial<Auth> | null;

export type Signup = z.infer<typeof SignUpSchema>;
export type Login = z.infer<typeof LoginSchema>;
