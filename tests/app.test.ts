import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app, startServer } from "../src/index";
import type { IncomingMessage, Server, ServerResponse } from "http";

describe("Server Health Check", () => {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(async () => {
    // Start the server before running tests
    server = await startServer();
  });

  afterAll(() => {
    // Close the server after tests are done
    if (server) {
      server.close();
    }
  });

  it("should return 200 for the health check endpoint", async () => {
    const response = await request(app).get("/health-check"); // Replace with your health check endpoint
    expect(response.status).toBe(200);
  });
});
