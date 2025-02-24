import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import config from "@/config/environment";
import { app, closeServer, startServer } from "@/index";

describe("POST /test", async () => {
  beforeAll(async () => {
    await startServer();
  });
  afterAll(async () => {
    closeServer();
  });

  it("should return status 200", async () => {
    const response = await request(app)
      .post(config.api.prefix + "/test")
      .send({ name: "test" });
    console.log("response:", response.body);

    expect(response.status).toBe(200);
    expect(response.body.test.name).toBe("test");
  });
});
