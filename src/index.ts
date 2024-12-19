import "reflect-metadata"; // We need this in order to use @Decorators

import express from "express";
import config from "@/config/environment";
import Logger from "@/logger/logger";

async function startServer() {
  console.log("Starting server initialization...");

  try {
    const app = express();

    console.log("Applying loaders...");
    await require("./loaders").default({ expressApp: app });

    app
      .listen(config.port, () => {
        Logger.info(`
        ################################################
        🛡️  Server listening on port: ${config.port} 🛡️
        ################################################
      `);
      })
      .on("error", (err) => {
        console.error("Server start error:", err);
        Logger.error(err);
        process.exit(1);
      });
  } catch (error) {
    console.error("Catastrophic server initialization error:", error);
    process.exit(1);
  }
}

startServer();
