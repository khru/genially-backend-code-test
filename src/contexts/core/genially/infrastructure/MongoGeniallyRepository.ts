import type { Collection, Db } from 'mongodb';
import Genially from '@domain/Genially';
import GeniallyRepository from '@domain/GeniallyRepository';
import GeniallyNotExist from '@domain/exception/GeniallyNotExist';

type GeniallyDoc = {
  _id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  modifiedAt?: Date | null;
  deletedAt?: Date | null;
};

export default class MongoGeniallyRepository implements GeniallyRepository {
  private readonly geniallyCollection: Collection<GeniallyDoc>;

  constructor(db: Db, collectionName = 'geniallies') {
    this.geniallyCollection = db.collection<GeniallyDoc>(collectionName);
  }

  async save(genially: Genially): Promise<void> {
    const doc: GeniallyDoc = {
      _id: genially.id,
      name: genially.name,
      description: genially.description ?? null,
      createdAt: genially.createdAt,
      modifiedAt: genially.modifiedAt ?? null,
      deletedAt: genially.deletedAt ?? null,
    };
    await this.geniallyCollection.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
  }

  async find(id: string): Promise<Genially> {
    const geniallyDocument = await this.geniallyCollection.findOne({ _id: id });
    if (!geniallyDocument) throw new GeniallyNotExist(id);

    return Genially.fromPrimitives({
      id: geniallyDocument._id,
      name: geniallyDocument.name,
      description: geniallyDocument.description ?? undefined,
      createdAt: geniallyDocument.createdAt,
      modifiedAt: geniallyDocument.modifiedAt ?? undefined,
      deletedAt: geniallyDocument.deletedAt ?? undefined,
    });
  }

  async delete(id: string): Promise<void> {
    const genially = await this.find(id);
    genially.delete();
    await this.save(genially);
  }
}
