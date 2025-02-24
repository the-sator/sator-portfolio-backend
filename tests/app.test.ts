import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app, closeServer, startServer } from "../src/index";
import config from "@/config/environment";

describe("Server Health Check", () => {
  beforeAll(async () => {
    await startServer();
  });
  afterAll(() => {
    closeServer();
  });
  it("should return 200 for the health check endpoint", async () => {
    const response = await request(app).get(
      config.api.prefix + "/health-check"
    );
    expect(response.status).toBe(200);
  });
});
