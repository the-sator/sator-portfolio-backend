import path from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load environment variables based on the current environment.
 * @param {string} env - The current environment (e.g., 'test', 'production').
 */
export const loadEnv = (env = process.env.NODE_ENV || "development") => {
  if (env === "test") {
    config({ path: path.resolve(__dirname, "../../.env.local") });
  } else {
    config({ path: path.resolve(__dirname, "../../.env") });
  }
};
