import Genially from "@domain/Genially";
import GeniallyRepository from "@domain/GeniallyRepository";
import { GeniallyFactory } from "@application/GeniallyFactory";

type CreateGeniallyServiceRequest = {
  id: string;
  name: string;
  description?: string;
};

export default class CreateGeniallyService {
  constructor(
    private readonly geniallyFactory: GeniallyFactory,
    private readonly geniallyRepository: GeniallyRepository,
  ) {}

  public async execute(request: CreateGeniallyServiceRequest): Promise<Genially> {
    const { id, name, description } = request;

    const genially = this.geniallyFactory.create({ id, name, description });

    await this.geniallyRepository.save(genially);

    return genially;
  }
}
