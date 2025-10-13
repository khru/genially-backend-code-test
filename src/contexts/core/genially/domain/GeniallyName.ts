import { InvalidGeniallyNameError } from "@domain/exception/InvalidGeniallyNameError";

export default class GeniallyName {
  private readonly _emptyLength = 0;
  private readonly _minLength = 3;
  private readonly _maxLength = 20;
  readonly name: string;

  constructor(name: string) {
    this.throwEmptyNameException(name);
    this.throwInvalidNameLength(name);

    this.name = name;
  }

  private throwInvalidNameLength(name: string) {
    if (name.length < this._minLength || name.length > this._maxLength) {
      throw new InvalidGeniallyNameError(
        `Name must have at least a length between ${this._minLength} and ${this._maxLength} characters`,
      );
    }
  }

  private throwEmptyNameException(name: string) {
    if (!name || name.trim().length === this._emptyLength) {
      throw new InvalidGeniallyNameError("Name cannot be empty");
    }
  }
}
