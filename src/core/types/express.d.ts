// declare module "express-serve-static-core" {
//   interface Response {
//     success<T = unknown>(
//       data?: T | null,
//       message?: string,
//       statusCode?: number
//     ): Response;
//     simpleSuccess(message?: string, statusCode?: number): Response;
//     error(message?: string, statusCode?: number, data?: unknown): Response;
//   }
// }

declare global {
  namespace Express {
    export interface Response {
      success<T = unknown>(
        data?: T | null,
        message?: string,
        statusCode?: number,
      ): Response;
      simpleSuccess(message?: string, statusCode?: number): Response;
      error(message?: string, statusCode?: number, data?: unknown): Response;
    }
  }
}
export {};
