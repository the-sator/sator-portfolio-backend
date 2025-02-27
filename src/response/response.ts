import type { Response } from "express";

export function SimpleSuccess(res: Response) {
  return res.json({
    data: {
      statusCode: 200,
      message: "Success",
    },
  });
}
