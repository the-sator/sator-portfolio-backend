import express from "express";
import cors from "cors";
import methodOverride from "method-override";
import routes from "@/routes/router";
import errorMiddleware from "@/core/middleware/error-handler";
import cookieParser from "cookie-parser";
import { OpticMiddleware } from "@useoptic/express-middleware";
import createHttpError from "http-errors";
import { env } from "@/libs";
import { responseWrapper } from "../middleware/response-wrapper";
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

  app.use(responseWrapper);

  // API routes
  app.use(env.API_PREFIX, routes());

  // 404 Handler - should be after all valid routes
  // API routes
  app.use("/{*any}", (_req, res, next) => {
    next(createHttpError(404, "Endpoint Not Found"));
  });

  app.use(errorMiddleware);

  // API Documentation - only enabled in non-production environments
  if (process.env.NODE_ENV !== "production") {
    app.use(
      OpticMiddleware({
        enabled: true,
      }),
    );
  }
}
