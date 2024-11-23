import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import logger from "@/logger/logger";
import createHttpError, { isHttpError } from "http-errors";
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

  // Return a sanitized error response
  response
    .status(statusCode)
    .json({ statusCode: statusCode, error: errorMessage });
};

export default errorMiddleware;
