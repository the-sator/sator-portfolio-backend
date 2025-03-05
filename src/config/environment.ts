import dotenv from "dotenv";
// process.env.NODE_ENV = process.env.NODE_ENV || "development";
// const envFound = dotenv.config({
//   path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
// });
if (process.env.NODE_ENV === "development") {
  const envFound = dotenv.config();
  if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️");
  }
}

export default {
  /**
   * Your favorite port
   */
  port: process.env.PORT,

  /**
   * That long string from mlab
   */
  databaseURL: process.env.DB_URI,

  passwordSalt: process.env.PASSWORD_SALT || 10,

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },

  /**
   * API configs
   */
  api: {
    prefix: "/api/v1",
  },

  api_key: {
    algo: process.env.API_KEY_ALGO || "H256",
    secret: process.env.API_KEY_SECRET || "secret",
    iv: process.env.API_KEY_IV || "",
  },

  encryptionCode: process.env.ENCRYPTION_KEY || "",
  defaultOTPCode: process.env.DEFAULT_OTP_CODE || "",
  defaultPassword: process.env.DEFAULT_PASSWORD || "",
};
