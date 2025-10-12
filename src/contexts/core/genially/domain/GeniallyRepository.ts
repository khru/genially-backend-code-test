import Genially from '@domain/Genially';

interface GeniallyRepository {
  save(genially: Genially): Promise<void>;

  find(id: string): Promise<Genially | undefined>;

  delete(id: string): Promise<void>;
}

export default GeniallyRepository;
