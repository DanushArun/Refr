import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

// Factory that returns an Express middleware validating the given request part
// against a Zod schema.  On success the parsed (coerced + default-applied) data
// replaces the raw value so downstream handlers always receive typed data.
// On failure, throws ZodError which is caught by the global error handler.
export function validate<T>(
  schema: ZodSchema<T>,
  part: RequestPart = 'body',
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // parse() throws ZodError on failure — propagated to error handler
    const parsed = schema.parse(req[part]);
    // Replace raw data with parsed (coerced, defaults applied) version
    (req as Record<string, unknown>)[part] = parsed;
    next();
  };
}
