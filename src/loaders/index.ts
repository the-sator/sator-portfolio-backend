import expressLoader from "./express";
import { socketLoader } from "./socket";
import Logger from "@/logger/logger";

export default async ({ expressApp }: any) => {
  try {
    console.log("Starting loader process...");

    // Ensure DB connection is established
    Logger.info("✌️ DB loaded and connected!");

    // Dependency Injection logging
    Logger.info("✌️ Dependency Injector loaded");

    // Apply express loader
    await expressLoader({ app: expressApp });
    await socketLoader({ app: expressApp });

    // Log after express loader
    Logger.info("✌️ Express loaded");
  } catch (error) {
    console.error("Error in loader process:", error);
    throw error;
  }
};
