import GeniallyValidationError from "@domain/exception/GeniallyValidationError";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import { InvalidGeniallyNameError } from "@domain/exception/InvalidGeniallyNameError";

export type GeniallyHttpError = {
  status: number;
  body: { error: string; details?: unknown };
};

export function mapGeniallyDomainErrorToHttpError(error: unknown): GeniallyHttpError | null {
  if (error instanceof GeniallyValidationError) {
    return { status: 400, body: { error: error.message, details: error.errors } };
  }

  if (error instanceof InvalidGeniallyNameError) {
    return { status: 400, body: { error: error.message } };
  }

  if (error instanceof GeniallyNotExist) {
    return { status: 404, body: { error: error.message } };
  }

  if (error instanceof GeniallyAlreadyDeleted) {
    return { status: 412, body: { error: error.message } };
  }

  return null;
}
