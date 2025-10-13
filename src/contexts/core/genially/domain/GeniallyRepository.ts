import Genially from "@domain/Genially";
import { GeniallyCount } from "@domain/GeniallyCount";

interface GeniallyRepository {
  save(genially: Genially): Promise<void>;

  find(id: string): Promise<Genially | undefined>;

  delete(id: string): Promise<void>;

  countCreated(): Promise<GeniallyCount>;
}

export default GeniallyRepository;
