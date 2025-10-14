import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

type CorrelationLocals = { correlationId: string };

export function correlationId(req: Request, res: Response<unknown, CorrelationLocals>, next: NextFunction): void {
  const incoming = req.header("x-correlation-id");
  const id = incoming && incoming.trim().length > 0 ? incoming : randomUUID();

  res.setHeader("x-correlation-id", id);
  res.locals.correlationId = id;
  next();
}
