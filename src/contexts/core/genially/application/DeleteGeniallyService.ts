import Genially from "../domain/Genially";
import GeniallyRepository from "../domain/GeniallyRepository";

export default class DeleteGeniallyService {
  constructor(private repository: GeniallyRepository) {
  }

  public async execute(id: string): Promise<Genially> {
    return undefined;
  }
}
