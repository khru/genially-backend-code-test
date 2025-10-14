import GeniallyRepository from "@domain/GeniallyRepository";

type DeleteGeniallyServiceRequest = {
  id: string;
};

export default class DeleteGeniallyService {
  constructor(private readonly geniallyRepository: GeniallyRepository) {}

  public async execute(request: DeleteGeniallyServiceRequest): Promise<void> {
    const { id } = request;
    const genially = await this.geniallyRepository.find(id);
    genially.delete();
    await this.geniallyRepository.save(genially);
  }
}
