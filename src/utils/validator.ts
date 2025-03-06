import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

import { StatusCodes } from "http-status-codes";
import { ThrowInternalServer } from "./exception";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(
          (issue) => `${issue.path.join(".")} is ${issue.message}`
        );

        console.log("errorMessages:", errorMessages);
        res.status(StatusCodes.BAD_REQUEST).json({
          statusCode: StatusCodes.BAD_REQUEST,
          error: errorMessages,
        });
      } else {
        ThrowInternalServer();
      }
    }
  };
}
