import Genially from "@domain/Genially";
import GeniallyRepository from "@domain/GeniallyRepository";
import { Clock } from "@domain/Clock";

type CreateGeniallyServiceRequest = {
  id: string;
  name: string;
  description?: string;
};

export default class CreateGeniallyService {
  constructor(
    private readonly clock: Clock,
    private readonly geniallyRepository: GeniallyRepository,
  ) {}

  public async execute(request: CreateGeniallyServiceRequest): Promise<Genially> {
    const { id, name, description } = request;

    const genially = new Genially(this.clock, id, name, description);

    await this.geniallyRepository.save(genially);

    return genially;
  }
}
