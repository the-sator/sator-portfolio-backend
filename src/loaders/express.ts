import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import methodOverride from "method-override";
import routes from "@/api";
import config from "@/config/environment";
import errorMiddleware from "@/api/middleware/errorHandler";
import cookieParser from "cookie-parser";
import { OpticMiddleware } from "@useoptic/express-middleware";
import createHttpError from "http-errors";
export default function configureExpress({
  app,
}: {
  app: express.Application;
}): void {
  // Security and parsing middleware
  app.enable("trust proxy");
  app.use(cors());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(express.json());

  // API routes
  app.use(config.api.prefix, routes());

  // 404 Handler - should be after all valid routes
  app.all("*", (_req: Request, res: Response, next: NextFunction) => {
    next(createHttpError(404, "Endpoint Not Found"));
  });

  app.use(errorMiddleware);

  // API Documentation - only enabled in non-production environments
  if (process.env.NODE_ENV !== "production") {
    app.use(
      OpticMiddleware({
        enabled: true,
      })
    );
  }
}
