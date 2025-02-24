import { COOKIE } from "@/types/base.type";
import type { CookieOptions, Request, Response } from "express";

export function setCookie(res: Response, name: string, value: string) {
  const options: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 15,
  };
  res.cookie(name, value, options);
}
export function deleteCookie(res: Response, name: string) {
  res.clearCookie(name, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });
}

export function getUserCookie(req: Request) {
  return req.cookies[COOKIE.USER];
}

export function getAdminCookie(req: Request) {
  return req.cookies[COOKIE.ADMIN];
}
export function getSiteUserCookie(req: Request) {
  return req.cookies[COOKIE.SITE_USER];
}
