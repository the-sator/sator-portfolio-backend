import "reflect-metadata"; // We need this in order to use @Decorators
import express from "express";
import config from "@/config/environment";
import Logger from "@/logger/logger";

// Export the app and startServer function
export const app = express();

export async function startServer() {
  console.log("Starting server initialization...");

  try {
    console.log("Applying loaders...");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaders = await import("./loaders");
    await loaders.default({ expressApp: app });

    const server = app.listen(config.port, () => {
      Logger.info(`
        ################################################
        🛡️  Server listening on port: ${config.port} 🛡️
        ################################################
      `);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log("\nReceived shutdown signal, shutting down gracefully...");
      server.close((err) => {
        if (err) {
          console.error("Error during server shutdown:", err);
          process.exit(1);
        }
        console.log("Server closed.");
        // Close other resources like database connections here
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
    return server;
  } catch (error) {
    console.error("Catastrophic server initialization error:", error);
    process.exit(1);
  }
}

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}
