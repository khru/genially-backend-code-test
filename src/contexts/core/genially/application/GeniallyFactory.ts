import Genially from "@domain/Genially";
import { Clock } from "@domain/Clock";

type CreateGeniallyParams = {
  id: string;
  name: string;
  description?: string;
};

export class GeniallyFactory {
  constructor(private readonly clock: Clock) {}

  create({ id, name, description }: CreateGeniallyParams): Genially {
    return new Genially(this.clock, id, name, description);
  }
}
