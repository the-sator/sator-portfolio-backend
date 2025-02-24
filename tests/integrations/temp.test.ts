import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import config from "@/config/environment";
import { app, closeServer, startServer } from "@/index";

describe("POST /test", () => {
  beforeAll(async () => {
    await startServer();
  });
  afterAll(() => {
    closeServer();
  });

  it("create should return status 200", async () => {
    const response = await request(app)
      .post(config.api.prefix + "/test")
      .send({ name: "test" });
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("test");
  });
  it("get all should return status 200", async () => {
    const response = await request(app).get(config.api.prefix + "/test");
    const data = response.body.data;
    expect(response.status).toBe(200);
    expect(data).not.toBe(null);
  });
});
