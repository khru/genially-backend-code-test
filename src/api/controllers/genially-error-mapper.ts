import { Response } from "express";
import GeniallyValidationError from "@domain/exception/GeniallyValidationError";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import { InvalidGeniallyNameError } from "@domain/exception/InvalidGeniallyNameError";

export function handleGeniallyError(response: Response, error: unknown): boolean {
  if (error instanceof GeniallyValidationError) {
    response.status(400).json({ error: error.message, details: error.errors });
    return true;
  }

  if (error instanceof InvalidGeniallyNameError) {
    response.status(400).json({ error: error.message });
    return true;
  }

  if (error instanceof GeniallyNotExist) {
    response.status(404).json({ error: error.message });
    return true;
  }

  if (error instanceof GeniallyAlreadyDeleted) {
    response.status(412).json({ error: error.message });
    return true;
  }

  return false;
}
