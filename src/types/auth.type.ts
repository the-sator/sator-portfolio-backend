import type { Admin, User } from "@prisma/client";
import { z } from "zod";

export const BaseAuthSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

// Extend the base schema for SignUp
export const SignUpSchema = BaseAuthSchema.extend({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required" })
    .max(20, {
      message: "Username must not exceed 20 characters",
    }),
});

// Extend the base schema for Login
export const LoginSchema = BaseAuthSchema.extend({
  otp: z.number().lt(999999, { message: "Must be 6 characters long" }),
});

export const UpdateTotpSchema = z.object({
  key: z.string().trim().min(1, { message: "Key is required" }),
  code: z.string().trim().min(1, { message: "Code is required" }),
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
export type UpdateTotp = z.infer<typeof UpdateTotpSchema>;
