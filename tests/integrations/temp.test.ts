import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import config from "@/config/environment";
import { app, closeServer, startServer } from "@/index";

describe("Testing Phase", () => {
  beforeAll(async () => {
    await startServer();
  });
  afterAll(() => {
    closeServer();
  });
  let testId: string;
  const prefix = config.api.prefix;
  it("create should return status 200", async () => {
    const response = await request(app)
      .post(prefix + "/test")
      .send({ name: "test" });
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("test");
    testId = response.body.data.id; // Store the created resource ID
  });
  it("get all should return status 200", async () => {
    const response = await request(app).get(prefix + "/test");
    const data = response.body.data;
    expect(response.status).toBe(200);
    expect(data).not.toBe(null);
  });
  it("update should return status 200", async () => {
    const response = await request(app)
      .put(prefix + "/test/" + testId)
      .send({ name: "updated test" });
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("updated test");
  });
});
