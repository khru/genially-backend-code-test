import type { RequestHandler } from "express";
import crypto from "crypto";

export const correlationId: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-correlation-id");
  const id = incoming && incoming.trim().length > 0 ? incoming : crypto.randomUUID();
  res.setHeader("x-correlation-id", id);
  (res.locals as any).correlationId = id;
  next();
};
