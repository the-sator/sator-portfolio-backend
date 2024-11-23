import express from "express";
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import methodOverride from "method-override";
import { OpticMiddleware } from "@useoptic/express-middleware";
import routes from "@/api";
import config from "@/config/environment";
import errorMiddleware from "@/api/middleware/errorHandler";
import createHttpError from "http-errors";
import cookieParser from "cookie-parser";
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

  // Health check endpoints
  app.get("/status", (req: Request, res: Response) => {
    res.status(200).end();
  });
  app.head("/status", (req: Request, res: Response) => {
    res.status(200).end();
  });

  // API routes
  app.use(config.api.prefix, routes());

  // 404 Handler - should be after all valid routes
  app.use((req: Request, res: Response, next: NextFunction) => {
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
