import "reflect-metadata"; // We need this in order to use @Decorators
import express from "express";
import config from "@/config/environment";
import { loadEnv } from "./utils/env";

// Export the app and startServer function
export const app = express();
let server: ReturnType<typeof app.listen>;

export async function startServer() {
  loadEnv();
  console.log("Starting server initialization...");

  try {
    console.log("Applying loaders...");
    const loaders = await import("./loaders");
    await loaders.default({ expressApp: app });

    const port = process.env.NODE_ENV === "test" ? 0 : config.port;
    server = app.listen(port, () => {
      console.log(`
        ################################################
        🛡️  Server listening on port: ${config.port} 🛡️
        ################################################
      `);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log("\nReceived shutdown signal, shutting down gracefully...");
      closeServer();
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
    return server;
  } catch (error) {
    console.error("Catastrophic server initialization error:", error);
    process.exit(1);
  }
}

export function closeServer() {
  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
    }
    console.log("Server closed.");
  });
}

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}
