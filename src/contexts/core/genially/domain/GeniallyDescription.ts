import { InvalidGeniallyDescriptionError } from "./InvalidGeniallyDescriptionError";

export default class GeniallyDescription {
  private readonly _maxLength = 125;
  readonly description: string;

  constructor(description: string | undefined) {
    this.throwInvalidNameLength(description);

    this.description = description;
  }

  private throwInvalidNameLength(description: string) {
    if (description && description.length > this._maxLength) {
      throw new InvalidGeniallyDescriptionError(`Description cannot exceed ${this._maxLength} characters`);
    }
  }

}
