import { startServer, closeServer, app } from "@/index";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { env } from "@/libs";
import request from "supertest";
import type { SignIn } from "@/modules/auth/dto/sign-in.dto";

describe("Admin", () => {
  const prefix = env.API_PREFIX;
  let token = "";

  beforeAll(async () => {
    await startServer();
  });

  afterAll(() => {
    closeServer();
  });

  it("Admin Sign in with Incorrect Email Should Return 404", async () => {
    const data: SignIn = {
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
    const data: SignIn = {
      email: "admin@test.com",
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
    const data: SignIn = {
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
