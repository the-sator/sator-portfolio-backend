import type { CookieOptions, Request, Response } from "express";

export function getUserCookie(req: Request) {
  return req.cookies["session-user"];
}

export function getAdminCookie(req: Request) {
  return req.cookies["session-admin"];
}

export function getSiteUserCookie(req: Request) {
  return req.cookies["session-site-user"];
}
