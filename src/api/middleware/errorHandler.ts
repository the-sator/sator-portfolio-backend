import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import logger from "@/logger/logger";
import createHttpError, { isHttpError } from "http-errors";
import { ZodError } from "zod";
const errorMiddleware: ErrorRequestHandler = (
  error,
  request,
  response,
  next
) => {
  // Log the error details for debugging
  logger.error("🔥 Error occurred: %o", error);
  let statusCode = 500;
  let errorMessage = "An unknown error occurred";

  // Check if the error is an HTTP error
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }

  if (error instanceof ZodError) {
    const errorMessages = error.errors.map((issue) => ({
      message: `${issue.path.join(".")} is ${issue.message}`,
    }));
    response
      .status(statusCode)
      .json({ statusCode: statusCode, error: errorMessages });
  }

  // Return a sanitized error response
  response
    .status(statusCode)
    .json({ statusCode: statusCode, error: errorMessage });
};

export default errorMiddleware;
