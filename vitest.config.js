import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    // globalSetup: "./tests/setup.ts", // Path to your global setup file
    environment: "node", // Run tests in a Node.js environment
    globals: true, // Enable global variables like `describe`, `it`, etc.
    coverage: {
      provider: "istanbul", // Enable code coverage
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
