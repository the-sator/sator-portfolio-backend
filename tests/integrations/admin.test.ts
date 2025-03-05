import { startServer, closeServer, app } from "@/index";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import config from "@/config/environment";
import request from "supertest";
import type { Login } from "@/types/auth.type";

describe("Admin", () => {
  const prefix = config.api.prefix;
  let token = "";

  beforeAll(async () => {
    await startServer();
  });

  afterAll(() => {
    closeServer();
  });

  it("Admin Sign in with Incorrect Email Should Return 404", async () => {
    const data: Login = {
      email: "admin@gmail.com", // Incorrect Email
      password: "12345678",
      otp: 666666,
    };
    // Create a new agent to maintain cookies
    // Perform login and store the session cookie
    const response = await request(app)
      .post(prefix + "/admin/login")
      .send(data);
    expect(response.status).toBe(404);
  });

  it("Admin Sign in with Incorrect Password Should Return 401", async () => {
    const data: Login = {
      email: "admin@test.com", // Incorrect Email
      password: "invalid",
      otp: 666666,
    };
    // Create a new agent to maintain cookies
    // Perform login and store the session cookie
    const response = await request(app)
      .post(prefix + "/admin/login")
      .send(data);
    expect(response.status).toBe(401);
  });

  it("Admin Sign in Correctly Should Return 200", async () => {
    const data: Login = {
      email: "admin@test.com",
      password: "12345678",
      otp: 666666,
    };
    // Create a new agent to maintain cookies
    // Perform login and store the session cookie
    const response = await request(app)
      .post(prefix + "/admin/login")
      .send(data);
    token = response.body.data.token;
    expect(response.status).toBe(200);
  });

  it("Admin Get Me Should Return 200", async () => {
    console.log("token:", token);
    const response = await request(app)
      .get(prefix + "/admin/me")
      .set("Cookie", `admin_token=${token}`);
    expect(response.status).toBe(200);
  });

  it("User Signout Should Return 200", async () => {
    const response = await request(app)
      .post(prefix + "/admin/signout")
      .set("Cookie", `admin_token=${token}`);
    expect(response.status).toBe(200);
  });
});
