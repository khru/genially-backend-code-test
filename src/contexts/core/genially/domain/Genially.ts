import GeniallyValidationError from "./GeniallyValidationError";

export default class Genially {
  private _id: string;
  private _name: string;
  private _description: string;
  private _createdAt: Date;
  private _modifiedAt: Date;
  private _deletedAt: Date;

  constructor(id: string, name: string, description?: string) {
    const validationErrors = this.validateInput(name, description);

    if (validationErrors.length > 0) {
      throw new GeniallyValidationError(validationErrors);
    }

    this._id = id;
    this._name = name;
    this._description = description;
    this._createdAt = new Date();
  }

  private validateInput(name: string, description?: string): string[] {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push("Name cannot be empty");
    } else if (name.length < 3 || name.length > 20) {
      errors.push("Name must have at least a length between 3 and 20 characters");
    }

    if (description !== undefined && description.length > 125) {
      errors.push("Description cannot exceed 125 characters");
    }

    return errors;
  }


  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get modifiedAt(): Date {
    return this._modifiedAt;
  }

  get deletedAt(): Date {
    return this._deletedAt;
  }
}
