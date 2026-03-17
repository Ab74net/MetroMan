import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
  }
}

export function parseWithSchema<T>(schema: ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new HttpError(parsed.error.issues.map((issue) => issue.message).join("; "), 400, "VALIDATION_ERROR");
  }

  return parsed.data;
}

export function asyncRoute(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>
): (request: Request, response: Response, next: NextFunction) => void {
  return (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
}
