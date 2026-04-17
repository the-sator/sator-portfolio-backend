/* eslint-disable @typescript-eslint/no-explicit-any */

import { ZodError } from "zod";

export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION = 422,
  INTERNAL_SERVER = 500,
}

export enum DefaultErrorMessage {
  BAD_REQUEST = "Bad Request",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  NOT_FOUND = "Not Found",
  INTERNAL_SERVER = "Internal Server",
  NETWORK_ERROR = "Network Error",
  CONFLICT = "Conflict",
  VALIDATION = "Validation Error",
  REQUEST_TIMEOUT = "Request timeout",
}

export type CustomException = {
  status: number;
  message: string;
  metadata?: Record<string, string>;
};

export type ErrorParams = {
  error?: unknown;
  message?: string;
  options?: Record<string, any>;
};
export class CriticalException extends Error {
  constructor(
    public status: number,
    message: string,
    public metadata?: Record<string, string>,
  ) {
    super(message);
    this.name = this.constructor.name;

    // Capture proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export class BadRequestException extends CriticalException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.BAD_REQUEST,
      params?.message || DefaultErrorMessage.BAD_REQUEST,
      params?.options,
    );
  }
}

export class NotFoundException extends CriticalException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.NOT_FOUND,
      params?.message || DefaultErrorMessage.NOT_FOUND,
      params?.options,
    );
  }
}

export class UnauthorizedException extends CriticalException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.UNAUTHORIZED,
      params?.message || DefaultErrorMessage.UNAUTHORIZED,
      params?.options,
    );
  }
}

export class ForbiddenException extends CriticalException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.FORBIDDEN,
      params?.message || DefaultErrorMessage.FORBIDDEN,
      params?.options,
    );
  }
}

export class InternalServerException extends CriticalException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.INTERNAL_SERVER,
      params?.message || DefaultErrorMessage.INTERNAL_SERVER,
      params?.options,
    );
  }
}

export class ConflictException extends CriticalException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.CONFLICT,
      params?.message || DefaultErrorMessage.CONFLICT,
      params?.options,
    );
  }
}

export class ValidationError extends CriticalException {
  constructor(params?: ErrorParams | ZodError) {
    let metadata: any;

    if (params instanceof ZodError) {
      metadata = params.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      }));
    } else {
      metadata = params?.options;
    }

    super(ErrorCode.VALIDATION, DefaultErrorMessage.VALIDATION, metadata);
  }
}
