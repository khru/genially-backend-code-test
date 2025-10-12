export default class GeniallyValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`);
    this.errors = errors;
    this.name = 'GeniallyValidationError';
  }
}
