import GeniallyValidationError from "./exception/GeniallyValidationError";
import GeniallyName from "./GeniallyName";
import GeniallyDescription from "./GeniallyDescription";
import GeniallyAlreadyDeleted from "./exception/GeniallyAlreadyDeleted";

export default class Genially {
  private readonly _id: string;
  private _name: GeniallyName;
  private readonly _description: GeniallyDescription;
  private readonly _createdAt: Date;
  private _modifiedAt: Date;
  private _deletedAt: Date;

  private readonly _validationErrors: string[] = [];
  private readonly thresholdErrors = 0;

  constructor(id: string, name: string, description?: string) {

    this._id = id;

    try {
      this._name = new GeniallyName(name);
    } catch (nameError) {
      this._validationErrors.push(nameError.message);
    }

    try {
      this._description = new GeniallyDescription(description);
    } catch (descriptionError) {
      this._validationErrors.push(descriptionError.message);
    }

    this._createdAt = new Date();

    this.throwErrorsIfThereAre();
  }

  private throwErrorsIfThereAre() {
    if (this._validationErrors.length > this.thresholdErrors) {
      throw new GeniallyValidationError(this._validationErrors);
    }
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name.name;
  }

  get description(): string {
    return this._description.description;
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

  delete(now: Date = new Date()) {
    if (this._deletedAt) throw new GeniallyAlreadyDeleted(this._id);
    this._deletedAt = now;
  }

  rename(newName: string) {
    if (this._deletedAt) {
      throw new GeniallyAlreadyDeleted(this._id);
    }
    this._name = new GeniallyName(newName);
    this._modifiedAt = new Date();
  }
}
