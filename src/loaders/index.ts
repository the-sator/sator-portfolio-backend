import Logger from "@/logger/logger";
import expressLoader from "./express";
import { redisLoader } from "./redis";
import { socketLoader } from "./socket";
import type { Express } from "express";

export default async ({ expressApp }: { expressApp: Express }) => {
  try {
    console.log("Starting loader process...");

    // Ensure DB connection is established
    Logger.info("✌️ DB loaded and connected!");

    // Dependency Injection logging
    Logger.info("✌️ Dependency Injector loaded");

    // Apply express loader
    await socketLoader({ app: expressApp });
    await expressLoader({ app: expressApp });
    await redisLoader();

    // Log after express loader
    Logger.info("✌️ Express loaded");
  } catch (error) {
    console.error("Error in loader process:", error);
    throw error;
  }
};
