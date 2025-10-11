import Genially from "../domain/Genially";
import GeniallyRepository from "../domain/GeniallyRepository";

type DeleteGeniallyServiceRequest = {
  id: string;
};

export default class DeleteGeniallyService {
  constructor(private repository: GeniallyRepository) {
  }

  public async execute(request: DeleteGeniallyServiceRequest): Promise<Genially> {
    return undefined;
  }
}
