import createHttpError from "http-errors";

export const ThrowInternalServer = (message?: string) => {
  throw createHttpError(500, {
    message: !!message ? message : "Something Went Wrong!",
  });
};

export const ThrowUnauthorized = (message?: string) => {
  throw createHttpError(401, {
    message: !!message ? message : "Unauthorized",
  });
};

export const ThrowForbidden = (message?: string) => {
  throw createHttpError(403, {
    message: !!message ? message : "Forbidden",
  });
};
