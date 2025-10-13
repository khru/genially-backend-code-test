import GeniallyRepository from "@domain/GeniallyRepository";

type DeleteGeniallyServiceRequest = {
  id: string;
};

export default class DeleteGeniallyService {
  constructor(private readonly geniallyRepository: GeniallyRepository) {
  }

  public async execute(request: DeleteGeniallyServiceRequest): Promise<void> {
    const {id} = request;
    await this.geniallyRepository.delete(id);
  }
}
