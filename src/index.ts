import "reflect-metadata"; // We need this in order to use @Decorators
import express from "express";
import Logger from "@/logger/logger";
import config from "@/config/environment";

async function startServer() {
  console.log("Starting server initialization...");

  try {
    const app = express();

    console.log("Applying loaders...");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    await require("./loaders").default({ expressApp: app });

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
  } catch (error) {
    console.error("Catastrophic server initialization error:", error);
    process.exit(1);
  }
}

startServer();
