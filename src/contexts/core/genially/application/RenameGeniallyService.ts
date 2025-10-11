import Genially from "../domain/Genially";
import GeniallyRepository from "../domain/GeniallyRepository";

class RenameGeniallyRequest {
  id: string;
  name: string;
}

export default class RenameGeniallyService {
  constructor(private readonly geniallyRepository: GeniallyRepository) {
  }

  public async execute(request: RenameGeniallyRequest): Promise<Genially> {
    const existingGenially = await this.geniallyRepository.find(request.id);
    existingGenially.rename(request.name);
    await this.geniallyRepository.save(existingGenially);
    return existingGenially;
  }
}
