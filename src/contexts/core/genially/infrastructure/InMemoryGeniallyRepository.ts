import Genially from "@domain/Genially";
import GeniallyRepository from "@domain/GeniallyRepository";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import { GeniallyCount } from "../domain/GeniallyCount";

export default class InMemoryGeniallyRepository implements GeniallyRepository {
  private geniallys: Genially[] = [];

  async save(genially: Genially): Promise<void> {
    await this.hardDelete(genially.id);
    this.geniallys.push(genially);
  }

  async find(id: string): Promise<Genially> {
    const genially: Genially = this.geniallys.find((genially) => genially.id === id);
    if (!genially) {
      throw new GeniallyNotExist(id);
    }
    return genially;
  }

  async delete(id: string): Promise<void> {
    const genially = await this.find(id);
    genially.delete();
    await this.save(genially);
  }

  async countCreated(): Promise<GeniallyCount> {
    const totalGeniallysCreated = this.geniallys.length;
    return new GeniallyCount(totalGeniallysCreated);
  }

  private async hardDelete(id: string): Promise<void> {
    this.geniallys = this.geniallys.filter((genially) => genially.id !== id);
  }
}
