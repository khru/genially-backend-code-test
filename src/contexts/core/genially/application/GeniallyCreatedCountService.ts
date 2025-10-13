import GeniallyRepository from "@domain/GeniallyRepository";
import { GeniallyCount } from "@domain/GeniallyCount";


export default class GeniallyCreatedCountService {
  constructor(private readonly geniallyRepository: GeniallyRepository) {
  }

  async execute(): Promise<GeniallyCount> {
    return this.geniallyRepository.countCreated();
  }
}
