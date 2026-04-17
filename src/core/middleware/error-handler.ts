import type { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";
import {
  CriticalException,
  ValidationError,
} from "../response/error/exception";
import { logger } from "@/libs";
import { isHttpError } from "http-errors";
// Do not try to remove unused params as it will result in the application return the error as HTML
const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next,
) => {
  console.log("YOU ARE HITTING THIS ENDPOINT 👉:", req.url);
  console.log("error:", error);
  let statusCode = error.status || 500;
  let errorMessage = error.errorMessage || "An unknown error occurred";

  logger.error("🔥 Error occurred: %o", error);

  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }

  if (error instanceof SyntaxError) {
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }

  if (error instanceof ZodError) {
    error = new ValidationError(error);
  }

  if (error instanceof CriticalException) {
    if (!(error instanceof ValidationError)) {
      logger.error("🔥 Error occurred: %o", error);
    }

    res.error(error.message, error.status, error.metadata);
    return;
  }

  // if (error instanceof Error) {
  //   // res.status(statusCode).json({
  //   //   status: statusCode,
  //   //   message: errorMessage,
  //   // });

  // }

  res.error(errorMessage, statusCode, error.metadata);
  // Return a sanitized error res
  // res.status(statusCode).json({
  //   status: statusCode,
  //   message: errorMessage,
  // });
};

export default errorMiddleware;
