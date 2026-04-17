import dotenv from "dotenv";
import { z } from "zod";

// process.env.NODE_ENV = process.env.NODE_ENV || "development";
// const envFound = dotenv.config({
//   path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
// });
if (process.env.NODE_ENV !== "production") {
  const envFound = dotenv.config();
  if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️");
  }
}

enum LogLevelEnum {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
}

enum NODE_ENV_ENUM {
  TEST = "test",
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

const envSchema = z.object({
  NODE_ENV: z.enum(NODE_ENV_ENUM).default(NODE_ENV_ENUM.DEVELOPMENT),
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  PASSWORD_SALT: z.coerce.number().default(10),
  API_PREFIX: z.string(),
  API_KEY_ALGO: z.string().default("aes-256-cbc"),
  API_KEY_SECRET: z.string(),
  ENCRYPTION_KEY: z.string(),
  DEFAULT_PASSWORD: z.string(),
  DEFAULT_OTP_CODE: z.string(),
  LOG_LEVEL: z.enum(LogLevelEnum).default(LogLevelEnum.DEBUG),
});

export const env = envSchema.parse(process.env);
