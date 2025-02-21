// test/setup.ts
import { startServer } from "@/index"; // Adjust the import path to your app
import type { Server } from "http";
import type { Express } from "express";

export let server: Server;
export let testApp: Express;

export const setup = async () => {
  server = await startServer();
  console.log("Server started for tests");
};

export const teardown = () => {
  if (server) {
    server.close();
    console.log("Server stopped after tests");
  }
};
