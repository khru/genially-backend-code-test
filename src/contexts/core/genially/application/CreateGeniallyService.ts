import Genially from "@domain/Genially";
import GeniallyRepository from "@domain/GeniallyRepository";

type CreateGeniallyServiceRequest = {
  id: string;
  name: string;
  description: string;
};

export default class CreateGeniallyService {
  constructor(private readonly geniallyRepository: GeniallyRepository) {
  }

  public async execute(req: CreateGeniallyServiceRequest): Promise<Genially> {
    const {id, name, description} = req;

    const genially = new Genially(id, name, description);

    await this.geniallyRepository.save(genially);

    return genially;
  }
}
