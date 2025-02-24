import type { ErrorRequestHandler, Response } from "express";
import logger from "@/logger/logger";
import { isHttpError } from "http-errors";
import { ZodError } from "zod";
// Do not try to remove unused params as it will result in the application return the error as HTML
const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    res
      .status(statusCode)
      .json({ statusCode: statusCode, error: errorMessages });
  }

  // Return a sanitized error res
  res.status(statusCode).json({ statusCode: statusCode, error: errorMessage });
};

export default errorMiddleware;
